/**
 * AST-powered UI drift checker (v2 governed refactor).
 *
 * Goals:
 * - consume the governed constant layer as the source of truth
 * - remove hardcoded scan roots / governed owner paths / inline-style filename heuristics
 * - centralize severity through rulePolicy
 * - keep one finding per AST node
 *
 * Usage:
 *   pnpm run script:check-ui-drift:ast
 *   pnpm run script:check-ui-drift:ast --format=json
 */
import path from "node:path"
import { existsSync } from "node:fs"
import {
  Node,
  Project,
  QuoteKind,
  type PropertyAssignment,
  type SourceFile,
} from "ts-morph"

import {
  resolveEffectiveClassPolicyTokenThresholds,
  type EffectiveClassPolicyTokenThresholds,
} from "../packages/shadcn-ui-deprecated/src/lib/constant/policy/class-governance-scope.ts"
import { styleBindingPolicy } from "../packages/shadcn-ui-deprecated/src/lib/constant/policy/style-binding.ts"
import {
  type AstFinding,
  type GovernanceModules,
  type RulePolicyShape,
  type Severity,
  countTailwindTokens,
  findRepoRoot,
  getOutputFormat,
  getRuleLevel,
  isAllowedArbitraryValueByPolicy,
  isBarrelResolvedModuleFile,
  isFeatureFile,
  isGovernedUiOwnerByPolicy,
  isInlineStyleExceptionByPolicy,
  isSemanticOwnerByPolicy,
  isValidInlineStyleException,
  listFilesForScanByPolicy,
  loadGovernanceModules,
  normalizePath,
  resolveModuleSpecifierToAbsolutePath,
  printJsonReport,
  printTextReport,
  truncateExcerpt,
  exitWithStatus,
  EXCLUDED_PATH_PARTS,
  RAW_ELEMENT_NAMES,
  GOVERNED_COMPONENT_NAMES,
  TRUTH_MAPPING_IMPORT_SOURCES,
  TAILWIND_UTILITY_RE,
} from "../tools/ui-drift/shared/index.js"

type RuleCode =
  | "UIX-AST-IMPORT-001"
  | "UIX-AST-IMPORT-002"
  | "UIX-AST-IMPORT-003"
  | "UIX-AST-IMPORT-004"
  | "UIX-AST-IMPORT-005"
  | "UIX-AST-IMPORT-006"
  | "UIX-AST-COLOR-001"
  | "UIX-AST-COLOR-002"
  | "UIX-AST-CLASS-001"
  | "UIX-AST-STYLE-001"
  | "UIX-AST-SEMANTIC-001"
  | "UIX-AST-SEMANTIC-002"
  | "UIX-AST-SEMANTIC-REQUIRED-001"
  | "UIX-AST-SEMANTIC-REQUIRED-002"
  | "UIX-AST-SEMANTIC-REQUIRED-003"
  | "UIX-AST-CONTROL-001"
  | "UIX-AST-VARIANT-001"
  | "UIX-AST-TOKEN-001"
  | "UIX-AST-TOKEN-002"
  | "UIX-AST-TOKEN-003"
  | "UIX-AST-TOKEN-004"
  | "UIX-AST-TRUTH-001"
  | "UIX-AST-TRUTH-002"
  | "UIX-AST-TRUTH-003"
  | "UIX-AST-COMPLEXITY-001"
  | "UIX-AST-COMPLEXITY-002"
  | "UIX-AST-COMPLEXITY-003"
  | "UIX-AST-COMPLEXITY-004"
  | "UIX-AST-COMPONENT-001"
  | "UIX-AST-COMPONENT-002"
  | "UIX-AST-COMPONENT-003"
  | "UIX-AST-SHELL-001"
  | "UIX-AST-SHELL-002"
  | "UIX-AST-SHELL-003"
  | "UIX-AST-SHELL-004"
  | "UIX-AST-SHELL-005"
  | "UIX-AST-SHELL-006"
  | "UIX-AST-SHELL-007"
  | "UIX-AST-SHELL-008"
  | "UIX-AST-SHELL-009"
  | "UIX-AST-SHELL-010"
  | "UIX-AST-SHELL-011"
  | "UIX-AST-SHELL-012"
  | "UIX-AST-SHELL-013"

const ROOT_DIR = findRepoRoot()
const REPORT_ROOT = ROOT_DIR

const TEST_FILE_RE = /\.(test|spec|stories)\.[jt]sx?$/

const RAW_TAILWIND_PALETTE_RE =
  /\b(?:bg|text|border|ring|stroke|fill)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/

const HARDCODED_COLOR_RE =
  /(?:(?:^|[\s;:,{(])#[0-9a-fA-F]{3,8}\b)|(?:rgb[a]?\()|(?:hsl[a]?\()|(?:oklch\()/

const ARBITRARY_VALUE_RE =
  /\b(?:w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|rounded|text|leading|tracking|top|right|bottom|left|inset|translate-x|translate-y|grid-cols|grid-rows)-\[[^\]]+\]/

const LOCAL_SEMANTIC_MAP_NAME_RE =
  /(?:status|severity|tone|intent|variant|color|badge|alert)(?:Class|Classes|Color|Colors|Tone|Variant|Map|Lookup)$/i

const LOCAL_VARIANT_FACTORY_NAME_RE =
  /^(?:get[A-Z].*Classes|create[A-Z].*Variants?|define[A-Z].*Variants?)$/

const DOMAIN_STATUS_MAP_KEYS_RE =
  /\b(?:paid|unpaid|pending|failed|success|error|warning|open|closed|draft|approved|rejected|cancelled|settled|unsettled|matched|unmatched|allocated|unallocated|overdue|blocked|low|medium|high|critical|partial|reversed|conflict|stale|missing|tampered|unverified)\b/i

const INLINE_METADATA_TOKEN_MAP_NAME_RE =
  /(?:metadata|status|severity|truth|disclosure|action|interaction|layout).*(?:token|class|tone|variant|map|lookup)|(?:token|class|tone|variant|map|lookup).*(?:metadata|status|severity|truth|disclosure|action|interaction|layout)/i

const INLINE_METADATA_TOKEN_VALUE_RE =
  /(?:text-|bg-|border-|ring-|shadow-|rounded-|var\(--|token(?:s)?\.|semantic(?:-|_)?token|tone(?:-|_)?|variant(?:-|_)?|destructive|warning|success|info)/i

const VISUAL_PROP_OR_VALUE_RE =
  /\b(?:className|tone|variant|severity|surface|emphasis|bg-|text-|border-|ring-|shadow-|rounded-|success|warning|destructive|danger|info|accent|primary)\b/

const SPACING_TOKEN_RE =
  /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y)-(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|px)\b/

const TYPOGRAPHY_TOKEN_RE =
  /\b(?:text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|leading-(?:none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)|tracking-(?:tighter|tight|normal|wide|wider|widest))\b/

const SURFACE_TOKEN_RE =
  /\b(?:rounded(?:-[a-z0-9]+)?|shadow(?:-[a-z0-9]+)?|border(?:-[a-z0-9/]+)?|ring(?:-[a-z0-9/]+)?)\b/

const LAYOUT_TOKEN_RE =
  /\b(?:w-|h-|min-w-|min-h-|max-w-|max-h-|grid-cols-|grid-rows-)\S+/

const LOW_LEVEL_PRIMITIVE_IMPORT_RE =
  /(?:^|\/)(?:alert|badge|input|table)(?:\.tsx?)?$/

const LOW_LEVEL_PRIMITIVE_NAMES = new Set(["Alert", "Badge", "Input", "Table"])

const SEMANTIC_WRAPPER_NAMES = new Set([
  "SemanticAlert",
  "SemanticBadge",
  "SemanticField",
  "SemanticPanel",
  "SemanticSection",
  "InvariantAlert",
  "InvariantBadge",
  "AllocationBadge",
  "SettlementBadge",
  "ReconciliationAlert",
])

const SHELL_ZONE_VALUES = new Set([
  "root",
  "header",
  "sidebar",
  "content",
  "panel",
  "overlay",
  "command",
  "footer",
  "main",
  "left",
  "right",
])

const SHELL_METADATA_KEYS = new Set([
  "zone",
  "density",
  "viewport",
  "navigationState",
  "commandAvailability",
  "inOverlay",
  "navigationContextBound",
])

const SHELL_DENSITY_VALUES = new Set([
  "compact",
  "comfortable",
  "spacious",
  "cozy",
  "dense",
  "wide",
])

const SHELL_VIEWPORT_VALUES = new Set([
  "mobile",
  "tablet",
  "desktop",
  "wide",
  "small",
  "medium",
  "large",
  "xl",
])

const TRUTH_RULE_KEYSETS: Array<{
  rule: Extract<
    RuleCode,
    "UIX-AST-TRUTH-001" | "UIX-AST-TRUTH-002" | "UIX-AST-TRUTH-003"
  >
  regex: RegExp
}> = [
  {
    rule: "UIX-AST-TRUTH-001",
    regex: /\b(?:low|medium|high|critical)\b/i,
  },
  {
    rule: "UIX-AST-TRUTH-002",
    regex:
      /\b(?:draft|pending|partial|allocated|reversed|blocked|failed|open|settled|overdue|matched|partially_matched|unmatched|conflict)\b/i,
  },
  {
    rule: "UIX-AST-TRUTH-003",
    regex: /\b(?:present|missing|stale|tampered|unverified)\b/i,
  },
]

const INLINE_STYLE_PROP_NAMES = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
  "outlineColor",
  "boxShadow",
  "borderRadius",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
])

const CSS_UTILITY_HINT_RE =
  /\b(?:bg-|text-|border-|ring-|stroke-|fill-|shadow-|rounded-)\b/

const findings: AstFinding[] = []
let activeRulePolicy: RulePolicyShape<RuleCode>
let governance: GovernanceModules<RuleCode>

function getScanRootsOverride(): string[] | null {
  const raw = process.env.UI_DRIFT_SCAN_ROOTS
  if (raw == null || raw.trim().length === 0) {
    return null
  }
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

async function main() {
  governance = await loadGovernanceModules<RuleCode>(ROOT_DIR)
  activeRulePolicy = governance.rulePolicy

  const {
    classPolicy,
    componentPolicy,
    metadataUiPolicy,
    ownershipPolicy,
    tailwindPolicy,
    shadcnPolicy,
    shellPolicy,
  } = governance

  const scanRoots = getScanRootsOverride() ?? ownershipPolicy.productRoots

  const productUiPrefixes = scanRoots.map((root) =>
    normalizePath(path.join(ROOT_DIR, root))
  )

  const project = new Project({
    tsConfigFilePath: findTsConfig(),
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
    },
  })

  const sourceFilesToScan = listFilesForScanByPolicy(ROOT_DIR, scanRoots)
  project.addSourceFilesAtPaths(sourceFilesToScan)

  const sourceFiles = project
    .getSourceFiles()
    .filter((sourceFile) => shouldScanFile(sourceFile, productUiPrefixes))

  for (const sourceFile of sourceFiles) {
    const file = normalizePath(sourceFile.getFilePath())
    const inFeature = isFeatureFile(file)
    const governed = isGovernedUiOwnerByPolicy(
      file,
      ROOT_DIR,
      ownershipPolicy.uiOwnerRoots
    )
    const semanticOwner = isSemanticOwnerByPolicy(
      file,
      ROOT_DIR,
      ownershipPolicy.semanticOwnerRoots
    )

    if (
      !governance.radixPolicy.allowDirectPrimitiveImportOutsideUiOwner ||
      !shadcnPolicy.allowCvaOutsideUiOwner ||
      inFeature
    ) {
      checkImports(sourceFile, governed, semanticOwner)
    }

    if (
      !tailwindPolicy.allowRawPaletteClasses ||
      !tailwindPolicy.allowHardcodedHexRgbHslColorsInProductUi ||
      !tailwindPolicy.allowArbitraryValuesInFeatures
    ) {
      checkStringLiterals(sourceFile, governed)
    }

    if (!tailwindPolicy.allowInlineVisualStyleProps) {
      checkJsxInlineStyles(sourceFile, governed)
    }

    if (!componentPolicy.allowFeatureLevelSemanticMaps) {
      checkLocalSemanticMaps(sourceFile, governed)
    }

    if (!componentPolicy.allowFeatureLevelVariantDefinition) {
      checkLocalVariantFactories(sourceFile, governed)
    }

    if (
      componentPolicy.requireGovernedComponentsInFeatures &&
      inFeature &&
      !governed
    ) {
      checkFeatureClassNameUsage(sourceFile)
      checkRawElementsWithTailwind(sourceFile)
      checkPrimitiveImports(sourceFile)
    }

    if (
      !classPolicy.allowDirectTokenUsageInFeatures &&
      inFeature &&
      !governed
    ) {
      checkUnboundTokens(sourceFile)
    }

    if (
      !metadataUiPolicy.allowInlineMetadataToTokenMappingInFeatures &&
      inFeature &&
      !governed
    ) {
      checkInlineMetadataToTokenMapping(sourceFile)
    }

    if (inFeature && !governed) {
      const tokenThresholds = resolveEffectiveClassPolicyTokenThresholds(
        classPolicy,
        file
      )
      if (
        tokenThresholds.maxRecommended > 0 ||
        tokenThresholds.warnTokens > 0 ||
        tokenThresholds.errorTokens > 0
      ) {
        checkClassNameComplexity(sourceFile, tokenThresholds)
      }
    }

    if (
      componentPolicy.requireGovernedDomainToUiMapping &&
      inFeature &&
      !governed
    ) {
      checkTruthMappingSources(sourceFile)
    }

    if (!governed) {
      checkRequireShellComponentRegistration(sourceFile)
      checkNoUndeclaredShellDependency(sourceFile)
      checkValidateShellZoneDeclaration(sourceFile)
    }

    if (inFeature && !governed) {
      if (!shellPolicy.allowFeatureLevelShellZoneFork) {
        checkLocalShellZoneVocabulary(sourceFile)
      }
      if (!shellPolicy.allowFeatureLevelShellMetadataFork) {
        checkLocalShellMetadataContract(sourceFile)
        checkFeatureShellProviderFork(sourceFile)
      }
      if (!shellPolicy.allowFeatureLevelNavigationContextFork) {
        checkFeatureNavigationContextFork(sourceFile)
      }
      if (!shellPolicy.allowFeatureLevelCommandInfrastructureFork) {
        checkFeatureCommandContextFork(sourceFile)
      }
      if (!shellPolicy.allowFeatureLevelDensityVocabularyFork) {
        checkFeatureDensityVocabularyFork(sourceFile)
      }
      if (!shellPolicy.allowFeatureLevelViewportVocabularyFork) {
        checkFeatureViewportVocabularyFork(sourceFile)
      }
      checkNoLocalShellContext(sourceFile)
      checkNoFeatureShellUseContext(sourceFile)
      checkPreferShellSelectorHooks(sourceFile)

      checkConditionalStylingComplexity(sourceFile)
      checkFeatureLocalWrapperExports(sourceFile)
    }
  }

  report()
}

function checkInlineMetadataToTokenMapping(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (!Node.isVariableDeclaration(node)) return

    const name = node.getName()
    if (!INLINE_METADATA_TOKEN_MAP_NAME_RE.test(name)) return

    const rawInitializer = node.getInitializer()
    const initializer = rawInitializer
      ? unwrapTypeAssertion(rawInitializer)
      : undefined
    if (!initializer || !Node.isObjectLiteralExpression(initializer)) return

    const objectText = initializer.getText()
    if (!INLINE_METADATA_TOKEN_VALUE_RE.test(objectText)) return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-CONTROL-001",
      "Inline metadata-to-token mapping detected in feature code. Route metadata through governed adapters/registries instead of local token maps."
    )
  })
}

function findTsConfig(): string {
  const candidates = [
    path.join(ROOT_DIR, "tsconfig.json"),
    path.join(ROOT_DIR, "tsconfig.base.json"),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  console.error("Unable to locate tsconfig.json or tsconfig.base.json")
  process.exit(2)
}

function shouldScanFile(
  sourceFile: SourceFile,
  productUiPrefixes: string[]
): boolean {
  const file = normalizePath(sourceFile.getFilePath())

  if (!/\.[jt]sx?$/.test(file)) return false
  if (TEST_FILE_RE.test(file)) return false
  if (EXCLUDED_PATH_PARTS.some((part) => file.includes(part))) return false
  if (!productUiPrefixes.some((prefix) => file.startsWith(prefix))) return false

  return true
}

function checkImports(
  sourceFile: SourceFile,
  governed: boolean,
  semanticOwner: boolean
) {
  const { radixPolicy, shadcnPolicy, importPolicy } = governance
  const sourcePath = normalizePath(sourceFile.getFilePath())
  const inImportPolicyOwner = isSourcePathWithinPrefixes(
    sourcePath,
    importPolicy.governedUiOwnerSourcePathPrefixes
  )
  const hasRadixSourceExemption = isSourcePathWithinPrefixes(
    sourcePath,
    importPolicy.directRadixImportAllowedSourcePathPrefixes
  )
  const hasCvaSourceExemption = isSourcePathWithinPrefixes(
    sourcePath,
    importPolicy.cvaImportAllowedSourcePathPrefixes
  )
  const hasLocalCnSourceExemption = isSourcePathWithinPrefixes(
    sourcePath,
    importPolicy.allowedLocalCnImportSourcePathPrefixes
  )
  const allowedGlobalStyleOwnerPaths = new Set(
    styleBindingPolicy.allowedGlobalStyleOwners.map((ownerPath: string) =>
      normalizePath(path.join(ROOT_DIR, ownerPath))
    )
  )
  const governedGlobalStyleOwnerBaseNames = new Set(
    styleBindingPolicy.allowedGlobalStyleOwners.map((ownerPath: string) =>
      path.basename(normalizePath(ownerPath))
    )
  )

  for (const decl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = decl.getModuleSpecifierValue()
    const importedNames = new Set(
      decl.getNamedImports().map((specifier) => specifier.getName())
    )
    const defaultImport = decl.getDefaultImport()?.getText()

    if (
      !radixPolicy.allowDirectPrimitiveImportOutsideUiOwner &&
      !governed &&
      !inImportPolicyOwner &&
      !hasRadixSourceExemption &&
      moduleSpecifier.startsWith("@radix-ui/react-")
    ) {
      pushNodeFinding(
        sourceFile,
        decl,
        "UIX-AST-IMPORT-001",
        "Direct @radix-ui/react-* import outside governed UI package. Use wrapped primitives only."
      )
    }

    if (
      !shadcnPolicy.allowCvaOutsideUiOwner &&
      !governed &&
      !inImportPolicyOwner &&
      !hasCvaSourceExemption &&
      moduleSpecifier === "class-variance-authority"
    ) {
      pushNodeFinding(
        sourceFile,
        decl,
        "UIX-AST-IMPORT-002",
        "class-variance-authority import outside governed UI package. Variant definition must live only in the governed UI owner package."
      )
    }

    // Skip semantic adapter import check for governed owners and semantic owners.
    if (!governed && !semanticOwner) {
      const isBannedImport =
        importPolicy.bannedImportPrefixes.some((pattern) =>
          moduleSpecifier.startsWith(pattern)
        ) || importPolicy.bannedExactImportPaths.includes(moduleSpecifier)

      if (
        !isBannedImport &&
        (moduleSpecifier === "clsx" || moduleSpecifier === "tailwind-merge")
      ) {
        pushNodeFinding(
          sourceFile,
          decl,
          "UIX-AST-IMPORT-003",
          "Tailwind/class merge helper imported outside governed UI package. Use governed semantic or primitive components instead."
        )
      } else if (
        shadcnPolicy.requireGovernedCnHelper &&
        (moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("@/")) &&
        (importedNames.has("cn") || defaultImport === "cn") &&
        !hasLocalCnSourceExemption &&
        !importPolicy.allowedCnImportPaths.some(
          (allowed) =>
            moduleSpecifier.endsWith(allowed) || moduleSpecifier === allowed
        )
      ) {
        pushNodeFinding(
          sourceFile,
          decl,
          "UIX-AST-IMPORT-003",
          "cn() imported from non-governed path. Use governed cn() from approved import paths only."
        )
      }

      // Only flag camelCase names that combine a domain concept with a UI-mapping word.
      // Excludes PascalCase component/type names and ALL_CAPS constants (false positives).
      const looksLikeLocalSemanticAdapterImport =
        (moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("@/")) &&
        [...importedNames].some(
          (name) =>
            /^[a-z]/.test(name) &&
            /(?:status|severity|badge|alert|tone|variant)/i.test(name) &&
            /(?:class|classes|color|colors|map|lookup|variant|presentation|uiModel)/i.test(
              name
            )
        )

      if (looksLikeLocalSemanticAdapterImport) {
        pushNodeFinding(
          sourceFile,
          decl,
          "UIX-AST-IMPORT-004",
          "Semantic adapter imported from a local feature/shared file. Import governed mappings from @afenda/shadcn-ui-deprecated/semantic or the constant layer instead."
        )
      }
    }

    if (
      importPolicy.bannedImportPatternLabels.includes(
        "barrel-import-in-feature"
      ) &&
      isFeatureFile(sourcePath) &&
      !governed &&
      !semanticOwner
    ) {
      const resolved = resolveModuleSpecifierToAbsolutePath(
        sourcePath,
        moduleSpecifier
      )
      if (
        resolved != null &&
        isBarrelResolvedModuleFile(resolved)
      ) {
        pushNodeFinding(
          sourceFile,
          decl,
          "UIX-AST-IMPORT-005",
          "Barrel import in feature code (importPolicy label barrel-import-in-feature). Import the concrete module instead of a directory or index re-export."
        )
      }
    }

    if (
      !styleBindingPolicy.allowFeatureLevelGlobalStyleFork &&
      moduleSpecifier.endsWith(".css")
    ) {
      const resolvedCssPath = resolveModuleSpecifierToAbsolutePath(
        sourcePath,
        moduleSpecifier
      )
      if (resolvedCssPath == null) continue

      const normalizedCssPath = normalizePath(resolvedCssPath)
      const cssFileName = path.basename(normalizedCssPath)
      const looksLikeGlobalOwnerImport =
        governedGlobalStyleOwnerBaseNames.has(cssFileName)

      if (
        looksLikeGlobalOwnerImport &&
        !allowedGlobalStyleOwnerPaths.has(normalizedCssPath)
      ) {
        const allowedOwnersList = [...styleBindingPolicy.allowedGlobalStyleOwners]
          .sort()
          .join(", ")
        pushNodeFinding(
          sourceFile,
          decl,
          "UIX-AST-IMPORT-006",
          `Global style owner import resolves to "${normalizePath(path.relative(ROOT_DIR, normalizedCssPath))}", which is not in styleBindingPolicy.allowedGlobalStyleOwners. Use one of: ${allowedOwnersList}.`
        )
      }
    }
  }
}

function isSourcePathWithinPrefixes(
  sourcePath: string,
  prefixes: readonly string[]
): boolean {
  return prefixes.some((prefix) =>
    sourcePath.includes(`/${normalizePath(prefix).replace(/^\/+/, "")}`)
  )
}

function checkStringLiterals(sourceFile: SourceFile, governed: boolean) {
  if (governed) return
  const { tailwindPolicy } = governance

  sourceFile.forEachDescendant((node) => {
    if (
      !Node.isStringLiteral(node) &&
      !Node.isNoSubstitutionTemplateLiteral(node)
    )
      return

    const value = node.getLiteralText()
    if (!value) return

    if (
      !tailwindPolicy.allowRawPaletteClasses &&
      RAW_TAILWIND_PALETTE_RE.test(value)
    ) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-COLOR-001",
        "Raw Tailwind palette class found. Use token-backed semantic classes instead."
      )
    }

    if (
      !tailwindPolicy.allowHardcodedHexRgbHslColorsInProductUi &&
      HARDCODED_COLOR_RE.test(value) &&
      !isTokenBackedColorUsage(value) &&
      !isLikelyProseWithHashRef(value)
    ) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-COLOR-002",
        "Hardcoded color literal found. Use CSS variables / semantic tokens instead."
      )
    }

    if (
      !tailwindPolicy.allowArbitraryValuesInFeatures &&
      ARBITRARY_VALUE_RE.test(value) &&
      !isAllowedArbitraryValueByPolicy(
        value,
        tailwindPolicy.allowedArbitraryValueFragments
      )
    ) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-CLASS-001",
        "Arbitrary Tailwind value found. Use governed scales, tokens, or approved component props instead."
      )
    }
  })
}

function isTokenBackedColorUsage(value: string): boolean {
  return /(?:rgb[a]?|hsl[a]?|oklch|oklab|lch|lab|color)\(\s*var\(/.test(value)
}

function isLikelyProseWithHashRef(value: string): boolean {
  if (/(?:rgb[a]?\()|(?:hsl[a]?\()|(?:oklch\()/.test(value)) return false
  if (CSS_UTILITY_HINT_RE.test(value)) return false
  if (/[;{}]/.test(value)) return false

  const hashMatches = value.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
  if (hashMatches.length !== 1) return false

  const wordCount = value.trim().split(/\s+/).length
  return wordCount >= 5
}

function checkJsxInlineStyles(sourceFile: SourceFile, governed: boolean) {
  if (governed) return
  const file = normalizePath(sourceFile.getFilePath())

  if (
    isInlineStyleExceptionByPolicy(
      file,
      ROOT_DIR,
      governance.ownershipPolicy.inlineStyleExceptionRoots
    )
  )
    return

  sourceFile.forEachDescendant((node) => {
    if (!Node.isJsxAttribute(node)) return
    if (node.getNameNode().getText() !== "style") return
    if (hasInlineStyleException(sourceFile, node)) return

    const initializer = node.getInitializer()
    if (!initializer || !Node.isJsxExpression(initializer)) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-STYLE-001",
        "Inline style prop found. Use tokens, variants, or governed props instead."
      )
      return
    }

    const rawExpression = initializer.getExpression()
    const expression = rawExpression
      ? unwrapTypeAssertion(rawExpression)
      : undefined
    if (!expression || !Node.isObjectLiteralExpression(expression)) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-STYLE-001",
        "Dynamic inline style expression found. Inline visual styling is not allowed here."
      )
      return
    }

    const visualProps = getVisualStyleProperties(expression)
    if (visualProps.length === 0) return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-STYLE-001",
      `Inline visual style prop found (${visualProps.join(", ")}). Use tokens, variants, or governed props instead.`
    )
  })
}

function hasInlineStyleException(sourceFile: SourceFile, node: Node): boolean {
  const fullText = sourceFile.getFullText()
  const start = node.getStart()
  const lookback = fullText.slice(Math.max(0, start - 400), start)

  return isValidInlineStyleException(lookback)
}

function getVisualStyleProperties(objectLiteral: Node): string[] {
  if (!Node.isObjectLiteralExpression(objectLiteral)) return []

  const props: string[] = []
  for (const prop of objectLiteral.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) continue

    const name = getPropertyName(prop)
    if (name != null && INLINE_STYLE_PROP_NAMES.has(name)) {
      props.push(name)
    }
  }

  return props
}

function checkLocalSemanticMaps(sourceFile: SourceFile, governed: boolean) {
  if (governed) return

  const file = normalizePath(sourceFile.getFilePath())
  if (
    isSemanticOwnerByPolicy(
      file,
      ROOT_DIR,
      governance.ownershipPolicy.semanticOwnerRoots
    )
  )
    return

  for (const statement of sourceFile.getVariableStatements()) {
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName()
      if (!LOCAL_SEMANTIC_MAP_NAME_RE.test(name)) continue

      const initializer = declaration.getInitializer()
      if (!initializer || !Node.isObjectLiteralExpression(initializer)) continue
      if (!looksLikeSemanticStyleMap(initializer)) continue

      pushNodeFinding(
        sourceFile,
        declaration,
        "UIX-AST-SEMANTIC-001",
        "Suspicious local semantic/style map found. Status/severity/domain-to-UI mapping should live in the governed semantic/domain layer."
      )
    }
  }
}

function looksLikeSemanticStyleMap(objectLiteral: Node): boolean {
  if (!Node.isObjectLiteralExpression(objectLiteral)) return false

  const props = objectLiteral.getProperties().filter(Node.isPropertyAssignment)
  if (props.length < 2) return false

  const keyText = props.map((prop) => getPropertyName(prop) ?? "").join(" ")
  const valueText = props
    .map((prop) => prop.getInitializer()?.getText() ?? "")
    .join(" ")

  return (
    DOMAIN_STATUS_MAP_KEYS_RE.test(keyText) &&
    VISUAL_PROP_OR_VALUE_RE.test(valueText)
  )
}

function checkLocalVariantFactories(sourceFile: SourceFile, governed: boolean) {
  if (governed) return
  if (governance.shadcnPolicy.allowLocalVariantFactoryOutsideUiOwner) return

  sourceFile.forEachDescendant((node) => {
    if (
      Node.isCallExpression(node) &&
      node.getExpression().getText() === "cva"
    ) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-VARIANT-001",
        "Local cva() usage detected outside governed UI package. Variant construction should live in the governed UI layer."
      )
    }

    if (Node.isFunctionDeclaration(node) || Node.isVariableDeclaration(node)) {
      const name =
        typeof node.getName === "function" ? node.getName() : undefined
      if (name != null && LOCAL_VARIANT_FACTORY_NAME_RE.test(name)) {
        pushNodeFinding(
          sourceFile,
          node,
          "UIX-AST-VARIANT-001",
          "Suspicious local variant factory detected. Variant construction should live in the governed UI layer."
        )
      }
    }
  })
}

function stripGoverned(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => token.length > 0 && !token.startsWith("ui-"))
    .join(" ")
}

function checkFeatureClassNameUsage(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (
      !Node.isJsxAttribute(node) ||
      node.getNameNode().getText() !== "className"
    )
      return

    const initializer = node.getInitializer()
    if (!initializer) return

    let classNameValue = ""
    if (Node.isStringLiteral(initializer)) {
      classNameValue = initializer.getLiteralText()
    } else if (Node.isJsxExpression(initializer)) {
      classNameValue = initializer.getText()
    }

    if (TAILWIND_UTILITY_RE.test(stripGoverned(classNameValue))) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SEMANTIC-REQUIRED-001",
        "Raw Tailwind className found in feature code. Prefer governed semantic components or approved shell primitives."
      )
    }
  })
}

function checkRawElementsWithTailwind(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (!Node.isJsxOpeningElement(node) && !Node.isJsxSelfClosingElement(node))
      return

    const tagName = node.getTagNameNode().getText()
    if (!RAW_ELEMENT_NAMES.has(tagName)) return

    const classNameAttr = node.getAttribute("className")
    if (!classNameAttr || !Node.isJsxAttribute(classNameAttr)) return

    const initializer = classNameAttr.getInitializer()
    if (!initializer) return

    let classNameValue = ""
    if (Node.isStringLiteral(initializer)) {
      classNameValue = initializer.getLiteralText()
    } else if (Node.isJsxExpression(initializer)) {
      const expr = initializer.getExpression()
      if (expr && Node.isStringLiteral(expr)) {
        classNameValue = expr.getLiteralText()
      } else if (expr) {
        classNameValue = expr.getText()
      }
    }

    if (TAILWIND_UTILITY_RE.test(stripGoverned(classNameValue))) {
      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SEMANTIC-REQUIRED-003",
        `Raw <${tagName}> with Tailwind utilities in feature code. Use a governed component (${[...GOVERNED_COMPONENT_NAMES].slice(0, 5).join(", ")}...) instead.`
      )
    }
  })
}

function checkUnboundTokens(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (!Node.isJsxOpeningElement(node) && !Node.isJsxSelfClosingElement(node))
      return

    const classNameAttr = node.getAttribute("className")
    if (!classNameAttr || !Node.isJsxAttribute(classNameAttr)) return

    const initializer = classNameAttr.getInitializer()
    if (!initializer) return

    let classNameValue = ""
    if (Node.isStringLiteral(initializer)) {
      classNameValue = initializer.getLiteralText()
    } else if (Node.isJsxExpression(initializer)) {
      const expr = initializer.getExpression()
      if (expr && Node.isStringLiteral(expr)) {
        classNameValue = expr.getLiteralText()
      }
    }

    if (SPACING_TOKEN_RE.test(classNameValue)) {
      pushNodeFinding(
        sourceFile,
        classNameAttr,
        "UIX-AST-TOKEN-001",
        "Unbound spacing token in feature code. Use semantic props or governed layout primitives instead."
      )
    }

    if (TYPOGRAPHY_TOKEN_RE.test(classNameValue)) {
      pushNodeFinding(
        sourceFile,
        classNameAttr,
        "UIX-AST-TOKEN-002",
        "Unbound typography token in feature code. Use semantic text or governed component variants instead."
      )
    }

    if (SURFACE_TOKEN_RE.test(classNameValue)) {
      pushNodeFinding(
        sourceFile,
        classNameAttr,
        "UIX-AST-TOKEN-003",
        "Unbound radius/shadow/border token in feature code. Use semantic surface components instead."
      )
    }

    if (LAYOUT_TOKEN_RE.test(classNameValue)) {
      pushNodeFinding(
        sourceFile,
        classNameAttr,
        "UIX-AST-TOKEN-004",
        "Direct width/height/grid sizing token found in feature code. Prefer governed layout primitives or semantic wrappers."
      )
    }
  })
}

function checkClassNameComplexity(
  sourceFile: SourceFile,
  thresholds: EffectiveClassPolicyTokenThresholds
) {
  const { resolvedScope, maxRecommended, warnTokens, errorTokens } = thresholds
  const lane =
    resolvedScope == null ? "global-only" : `lane:${resolvedScope}`

  sourceFile.forEachDescendant((node) => {
    if (!Node.isJsxOpeningElement(node) && !Node.isJsxSelfClosingElement(node))
      return

    const classNameAttr = node.getAttribute("className")
    if (!classNameAttr || !Node.isJsxAttribute(classNameAttr)) return

    const initializer = classNameAttr.getInitializer()
    if (!initializer) return

    let classNameValue = ""
    if (Node.isStringLiteral(initializer)) {
      classNameValue = initializer.getLiteralText()
    } else if (Node.isJsxExpression(initializer)) {
      const expr = initializer.getExpression()
      if (expr && Node.isStringLiteral(expr)) {
        classNameValue = expr.getLiteralText()
      }
    }

    const tokenCount = countTailwindTokens(classNameValue)

    if (errorTokens > 0 && tokenCount > errorTokens) {
      pushNodeFinding(
        sourceFile,
        classNameAttr,
        "UIX-AST-COMPLEXITY-004",
        `className has ${tokenCount} Tailwind tokens (${lane}, error threshold ${errorTokens}). Extract to a governed component or use semantic variants.`
      )
      return
    }

    if (warnTokens > 0 && tokenCount > warnTokens) {
      pushNodeFinding(
        sourceFile,
        classNameAttr,
        "UIX-AST-COMPLEXITY-001",
        `className has ${tokenCount} Tailwind tokens (${lane}, warn ${warnTokens}, error at ${errorTokens}). Extract to a governed component or use semantic variants.`
      )
      return
    }

    if (maxRecommended > 0 && tokenCount > maxRecommended) {
      pushNodeFinding(
        sourceFile,
        classNameAttr,
        "UIX-AST-COMPLEXITY-001",
        `className has ${tokenCount} Tailwind tokens (${lane}, recommended max ${maxRecommended}). Extract to a governed component or use semantic variants.`
      )
    }
  })
}

function checkPrimitiveImports(sourceFile: SourceFile) {
  for (const decl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = decl.getModuleSpecifierValue()
    if (!LOW_LEVEL_PRIMITIVE_IMPORT_RE.test(moduleSpecifier)) continue

    const importedPrimitive = decl
      .getNamedImports()
      .map((specifier) => specifier.getName())
      .find((name) => LOW_LEVEL_PRIMITIVE_NAMES.has(name))

    if (importedPrimitive == null) continue

    pushNodeFinding(
      sourceFile,
      decl,
      "UIX-AST-COMPONENT-001",
      `Low-level ${importedPrimitive} imported in feature code. Prefer a governed semantic wrapper when one exists.`
    )
  }
}

function checkConditionalStylingComplexity(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (!Node.isConditionalExpression(node)) return

    const text = node.getText()
    if (!VISUAL_PROP_OR_VALUE_RE.test(text)) return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-COMPLEXITY-002",
      "Conditional styling logic found in render code. Move visual decision trees into governed semantic adapters."
    )
  })
}

function checkFeatureLocalWrapperExports(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (
      !Node.isFunctionDeclaration(node) &&
      !Node.isVariableDeclaration(node) &&
      !Node.isClassDeclaration(node)
    ) {
      return
    }

    const hasExport = Node.isClassDeclaration(node)
      ? node.isExported()
      : typeof node.isExported === "function"
        ? node.isExported()
        : false
    if (!hasExport) return

    const name = typeof node.getName === "function" ? node.getName() : undefined
    if (name == null) return
    if (SEMANTIC_WRAPPER_NAMES.has(name)) return
    if (!/(?:Badge|Panel|Section|Alert|Field|Card)$/i.test(name)) return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-COMPONENT-002",
      "Feature file exports a reusable visual wrapper. Move generic visual abstractions into the governed UI package."
    )
  })
}

function checkLocalShellZoneVocabulary(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (Node.isVariableDeclaration(node)) {
      const name = node.getName()
      if (!/(?:shell.*zone|zone.*(?:values|options|enum))/i.test(name)) return

      const values = getStringLiteralValuesFromInitializer(node.getInitializer())
      if (values.length < 2) return
      if (!values.some((value) => SHELL_ZONE_VALUES.has(value))) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-001",
        "Local shell-zone vocabulary found in feature code. Import and consume canonical shell zone vocabulary from the governed constant layer."
      )
      return
    }

    if (Node.isTypeAliasDeclaration(node)) {
      const name = node.getName()
      if (!/(?:shell.*zone|zone.*(?:type|kind))/i.test(name)) return

      const values = getStringLiteralsFromUnionType(node.getTypeNode())
      if (values.length < 2) return
      if (!values.some((value) => SHELL_ZONE_VALUES.has(value))) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-001",
        "Local shell-zone union type found in feature code. Reuse canonical shell zone types from shell policy governance."
      )
    }
  })
}

function checkLocalShellMetadataContract(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node)) {
      const name = node.getName()
      if (!/(?:shell.*meta|meta.*shell|shell.*state)/i.test(name)) return

      const keyCount = countShellMetadataKeysInTypeNode(node.getTypeNode())
      if (keyCount < 3) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-002",
        "Feature-local shell metadata contract detected. Consume canonical ShellMetadata from the governed constant layer."
      )
      return
    }

    if (Node.isVariableDeclaration(node)) {
      const name = node.getName()
      if (!/(?:shell.*meta|meta.*shell|shell.*state)/i.test(name)) return

      const initializer = node.getInitializer()
      if (!initializer || !Node.isObjectLiteralExpression(initializer)) return

      const keyCount = countShellMetadataKeysInObjectLiteral(initializer)
      if (keyCount < 3) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-002",
        "Feature-local shell metadata object detected. Use canonical shell metadata provider/hook surfaces instead."
      )
    }
  })
}

function checkFeatureShellProviderFork(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (
      !Node.isFunctionDeclaration(node) &&
      !Node.isVariableDeclaration(node) &&
      !Node.isClassDeclaration(node)
    ) {
      return
    }

    const name = typeof node.getName === "function" ? node.getName() : undefined
    if (name == null) return
    if (!/(?:^ShellProvider$|^AppShellProvider$|^ShellMetadataProvider$)/.test(name)) {
      return
    }

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-SHELL-003",
      "Feature-level shell provider declaration detected. Shell provider infrastructure must remain platform-owned."
    )
  })
}

function checkFeatureNavigationContextFork(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (Node.isVariableDeclaration(node)) {
      const name = node.getName()
      const initializer = node.getInitializer()
      if (
        initializer &&
        Node.isCallExpression(initializer) &&
        initializer.getExpression().getText() === "createContext" &&
        /(?:NavigationContext|NavContext|SidebarContext)/.test(name)
      ) {
        pushNodeFinding(
          sourceFile,
          node,
          "UIX-AST-SHELL-004",
          "Feature-local navigation context detected. Use canonical shell navigation context instead of forking runtime navigation truth."
        )
      }
      return
    }

    if (
      Node.isFunctionDeclaration(node) ||
      Node.isClassDeclaration(node) ||
      Node.isVariableDeclaration(node)
    ) {
      const name = typeof node.getName === "function" ? node.getName() : undefined
      if (name == null) return
      if (!/(?:NavigationProvider|NavProvider|SidebarProvider)/.test(name)) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-004",
        "Feature-level navigation provider fork detected. Keep navigation runtime context in shell infrastructure."
      )
    }
  })
}

function checkFeatureCommandContextFork(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (Node.isVariableDeclaration(node)) {
      const name = node.getName()
      const initializer = node.getInitializer()
      if (
        initializer &&
        Node.isCallExpression(initializer) &&
        initializer.getExpression().getText() === "createContext" &&
        /(?:CommandContext|CommandPaletteContext|GlobalSearchContext)/.test(name)
      ) {
        pushNodeFinding(
          sourceFile,
          node,
          "UIX-AST-SHELL-005",
          "Feature-local command context detected. Use canonical shell command infrastructure context."
        )
      }
      return
    }

    if (
      Node.isFunctionDeclaration(node) ||
      Node.isClassDeclaration(node) ||
      Node.isVariableDeclaration(node)
    ) {
      const name = typeof node.getName === "function" ? node.getName() : undefined
      if (name == null) return
      if (!/(?:CommandProvider|CommandPaletteProvider|CommandMenuProvider)/.test(name)) {
        return
      }

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-005",
        "Feature-level command provider fork detected. Global command infrastructure must remain shell-owned."
      )
    }
  })
}

function checkFeatureDensityVocabularyFork(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (Node.isVariableDeclaration(node)) {
      const name = node.getName()
      if (!/(?:density|layoutDensity|uiDensity)/i.test(name)) return

      const values = getStringLiteralValuesFromInitializer(node.getInitializer())
      if (values.length < 2) return
      if (!values.some((value) => SHELL_DENSITY_VALUES.has(value))) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-006",
        "Feature-local density vocabulary detected. Use canonical shell density semantics."
      )
      return
    }

    if (Node.isTypeAliasDeclaration(node)) {
      const name = node.getName()
      if (!/(?:density|layoutDensity|uiDensity)/i.test(name)) return

      const values = getStringLiteralsFromUnionType(node.getTypeNode())
      if (values.length < 2) return
      if (!values.some((value) => SHELL_DENSITY_VALUES.has(value))) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-006",
        "Feature-local density union type detected. Reuse canonical shell density vocabulary."
      )
    }
  })
}

function checkFeatureViewportVocabularyFork(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (Node.isVariableDeclaration(node)) {
      const name = node.getName()
      if (!/(?:viewport|breakpoint|device(?:Kind|Type)?)/i.test(name)) return

      const values = getStringLiteralValuesFromInitializer(node.getInitializer())
      if (values.length < 2) return
      if (!values.some((value) => SHELL_VIEWPORT_VALUES.has(value))) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-007",
        "Feature-local viewport vocabulary detected. Use canonical shell viewport semantics."
      )
      return
    }

    if (Node.isTypeAliasDeclaration(node)) {
      const name = node.getName()
      if (!/(?:viewport|breakpoint|device(?:Kind|Type)?)/i.test(name)) return

      const values = getStringLiteralsFromUnionType(node.getTypeNode())
      if (values.length < 2) return
      if (!values.some((value) => SHELL_VIEWPORT_VALUES.has(value))) return

      pushNodeFinding(
        sourceFile,
        node,
        "UIX-AST-SHELL-007",
        "Feature-local viewport union type detected. Reuse canonical shell viewport vocabulary."
      )
    }
  })
}

function checkNoLocalShellContext(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (!Node.isVariableDeclaration(node)) return
    const name = node.getName()
    const initializer = node.getInitializer()
    if (!initializer || !Node.isCallExpression(initializer)) return
    if (initializer.getExpression().getText() !== "createContext") return
    if (
      !/(?:Shell.*Context|ShellMetadataContext|NavigationContext|CommandContext|LayoutContext|ViewportContext)/.test(
        name
      )
    ) {
      return
    }

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-SHELL-008",
      "Local shell-related context detected in feature code. Use canonical shell provider/hook surfaces instead of feature-level context creation."
    )
  })
}

function checkNoFeatureShellUseContext(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (!Node.isCallExpression(node)) return
    if (node.getExpression().getText() !== "useContext") return
    const firstArg = node.getArguments()[0]
    if (!firstArg) return
    const contextName = firstArg.getText()
    if (
      !/(?:Shell.*Context|ShellMetadataContext|NavigationContext|CommandContext|LayoutContext|ViewportContext)/.test(
        contextName
      )
    ) {
      return
    }

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-SHELL-009",
      "Feature-level useContext on shell-like context detected. Prefer canonical shell hooks (useShellMetadata / selector hooks)."
    )
  })
}

function checkPreferShellSelectorHooks(sourceFile: SourceFile) {
  sourceFile.forEachDescendant((node) => {
    if (!Node.isBinaryExpression(node)) return
    const op = node.getOperatorToken().getText()
    if (op !== "===" && op !== "!==") return

    const expressionText = node.getText()
    const isShellFieldCompare =
      /\b(?:shell|metadata)\.(?:zone|viewport|navigationState|density|commandAvailability)\b/.test(
        expressionText
      ) && /['"](?:root|header|sidebar|content|panel|overlay|command|footer|mobile|tablet|desktop|wide|compact|comfortable|spacious|expanded|collapsed|hidden|enabled|disabled)['"]/.test(
        expressionText
      )

    if (!isShellFieldCompare) return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-SHELL-010",
      "Direct shell metadata comparison found. Prefer canonical shell selectors or selector hooks for repeated shell semantics."
    )
  })
}

function checkRequireShellComponentRegistration(sourceFile: SourceFile) {
  const filePath = normalizePath(sourceFile.getFilePath())
  if (!filePath.includes("/components/shell-ui/")) return

  const registeredComponentNames = new Set(
    Object.values(governance.shellComponentRegistry).map(
      (entry) => entry.componentName
    )
  )

  sourceFile.forEachDescendant((node) => {
    if (!Node.isFunctionDeclaration(node)) return
    if (!node.isExported()) return

    const name = node.getName()
    if (!name || !/^Shell[A-Z]/.test(name)) return
    if (registeredComponentNames.has(name)) return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-SHELL-011",
      `Shell-aware component "${name}" is not registered in shell-component-registry. Add a canonical registry entry before using this component as shell infrastructure.`
    )
  })
}

function checkNoUndeclaredShellDependency(sourceFile: SourceFile) {
  const filePath = normalizePath(sourceFile.getFilePath())
  if (!filePath.includes("/components/shell-ui/")) return

  const contractByComponentName = new Map(
    Object.values(governance.shellComponentRegistry).map((entry) => [
      entry.componentName,
      entry,
    ])
  )

  sourceFile.forEachDescendant((node) => {
    if (!Node.isFunctionDeclaration(node) || !node.isExported()) return
    const componentName = node.getName()
    if (!componentName || !/^Shell[A-Z]/.test(componentName)) return

    const contract = contractByComponentName.get(componentName)
    if (!contract) return

    const body = node.getBody()
    if (!body) return
    const bodyText = body.getText()
    const usesShellMetadata =
      /useShellMetadata\(/.test(bodyText) ||
      /useIsShell[A-Z]/.test(bodyText) ||
      /isShell[A-Z]/.test(bodyText)

    if (!usesShellMetadata) return
    if (contract.participation.shellMetadata !== "none") return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-SHELL-012",
      `Component "${componentName}" consumes shell metadata/selectors but registry declares participation.shellMetadata as "none". Update shell-component-registry contract.`
    )
  })
}

function checkValidateShellZoneDeclaration(sourceFile: SourceFile) {
  const filePath = normalizePath(sourceFile.getFilePath())
  if (!filePath.includes("/components/shell-ui/")) return

  const contractByComponentName = new Map(
    Object.values(governance.shellComponentRegistry).map((entry) => [
      entry.componentName,
      entry,
    ])
  )

  sourceFile.forEachDescendant((node) => {
    if (!Node.isFunctionDeclaration(node) || !node.isExported()) return
    const componentName = node.getName()
    if (!componentName || !/^Shell[A-Z]/.test(componentName)) return

    const contract = contractByComponentName.get(componentName)
    if (!contract || contract.zone == null) return

    const impliedZone = inferZoneFromComponentName(componentName)
    if (!impliedZone || impliedZone === contract.zone) return

    pushNodeFinding(
      sourceFile,
      node,
      "UIX-AST-SHELL-013",
      `Component "${componentName}" implies "${impliedZone}" zone but registry declares "${contract.zone}". Align component naming or registry zone declaration.`
    )
  })
}

function inferZoneFromComponentName(name: string): string | null {
  if (/Header/.test(name)) return "header"
  if (/Sidebar/.test(name)) return "sidebar"
  if (/Overlay|Popover|Dialog|Modal/.test(name)) return "overlay"
  if (/Panel/.test(name)) return "panel"
  if (/Content/.test(name)) return "content"
  if (/Footer/.test(name)) return "footer"
  if (/Command/.test(name)) return "command"
  return null
}

function getStringLiteralValuesFromInitializer(initializer: Node | undefined): string[] {
  if (!initializer) return []

  if (Node.isArrayLiteralExpression(initializer)) {
    return initializer
      .getElements()
      .filter(
        (element): element is Node =>
          Node.isStringLiteral(element) || Node.isNoSubstitutionTemplateLiteral(element)
      )
      .map((element) =>
        Node.isStringLiteral(element) || Node.isNoSubstitutionTemplateLiteral(element)
          ? element.getLiteralText()
          : ""
      )
      .filter((value) => value.length > 0)
  }

  return []
}

function getStringLiteralsFromUnionType(typeNode: Node | undefined): string[] {
  if (!typeNode || !Node.isUnionTypeNode(typeNode)) return []

  const values: string[] = []
  for (const node of typeNode.getTypeNodes()) {
    if (Node.isLiteralTypeNode(node)) {
      const literal = node.getLiteral()
      if (
        Node.isStringLiteral(literal) ||
        Node.isNoSubstitutionTemplateLiteral(literal)
      ) {
        values.push(literal.getLiteralText())
      }
    }
  }
  return values
}

function countShellMetadataKeysInObjectLiteral(node: Node): number {
  if (!Node.isObjectLiteralExpression(node)) return 0
  const keys = new Set<string>()
  for (const prop of node.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) continue
    const key = getPropertyName(prop)
    if (key && SHELL_METADATA_KEYS.has(key)) keys.add(key)
  }
  return keys.size
}

function countShellMetadataKeysInTypeNode(typeNode: Node | undefined): number {
  if (!typeNode) return 0
  const keys = new Set<string>()

  if (Node.isTypeLiteralNode(typeNode)) {
    for (const member of typeNode.getMembers()) {
      if (!Node.isPropertySignature(member)) continue
      const nameNode = member.getNameNode()
      if (
        Node.isIdentifier(nameNode) ||
        Node.isStringLiteral(nameNode) ||
        Node.isNumericLiteral(nameNode)
      ) {
        const key = nameNode.getText().replace(/^["']|["']$/g, "")
        if (SHELL_METADATA_KEYS.has(key)) keys.add(key)
      }
    }
  }

  return keys.size
}

function checkTruthMappingSources(sourceFile: SourceFile) {
  const importSources = new Set<string>()
  for (const decl of sourceFile.getImportDeclarations()) {
    importSources.add(decl.getModuleSpecifierValue())
  }

  const hasGovernedTruthImport = TRUTH_MAPPING_IMPORT_SOURCES.some((source) =>
    [...importSources].some((imp) => imp.includes(source))
  )

  for (const statement of sourceFile.getVariableStatements()) {
    for (const declaration of statement.getDeclarations()) {
      const initializer = declaration.getInitializer()
      if (!initializer || !Node.isObjectLiteralExpression(initializer)) continue

      const matchedTruthRule = getTruthRuleForMapping(initializer)
      if (matchedTruthRule != null && !hasGovernedTruthImport) {
        pushNodeFinding(
          sourceFile,
          declaration,
          matchedTruthRule,
          "Domain-to-UI mapping defined locally. Import from governed constant layer (@afenda/shadcn-ui-deprecated/lib/constant) instead."
        )
      }
    }
  }
}

function looksLikeDomainToUiMapping(objectLiteral: Node): boolean {
  if (!Node.isObjectLiteralExpression(objectLiteral)) return false

  const props = objectLiteral.getProperties().filter(Node.isPropertyAssignment)
  if (props.length < 2) return false

  const keyText = props.map((prop) => getPropertyName(prop) ?? "").join(" ")
  const valueText = props
    .map((prop) => prop.getInitializer()?.getText() ?? "")
    .join(" ")

  const hasDomainKeys = DOMAIN_STATUS_MAP_KEYS_RE.test(keyText)
  const hasUiValues =
    /\b(?:success|warning|destructive|info|default|outline|secondary|bg-|text-|border-)\b/.test(
      valueText
    )

  return hasDomainKeys && hasUiValues
}

function getTruthRuleForMapping(objectLiteral: Node): RuleCode | null {
  if (!looksLikeDomainToUiMapping(objectLiteral)) return null
  if (!Node.isObjectLiteralExpression(objectLiteral)) return null

  const props = objectLiteral.getProperties().filter(Node.isPropertyAssignment)
  const keyText = props.map((prop) => getPropertyName(prop) ?? "").join(" ")

  for (const entry of TRUTH_RULE_KEYSETS) {
    if (entry.regex.test(keyText)) {
      return entry.rule
    }
  }

  return "UIX-AST-TRUTH-002"
}

function unwrapTypeAssertion(node: Node): Node {
  if (Node.isAsExpression(node) || Node.isSatisfiesExpression(node)) {
    return node.getExpression()
  }
  return node
}

function getPropertyName(prop: PropertyAssignment): string | undefined {
  const nameNode = prop.getNameNode()

  if (
    Node.isIdentifier(nameNode) ||
    Node.isStringLiteral(nameNode) ||
    Node.isNumericLiteral(nameNode)
  ) {
    return nameNode.getText().replace(/^["']|["']$/g, "")
  }

  return undefined
}

function pushNodeFinding(
  sourceFile: SourceFile,
  node: Node,
  rule: RuleCode,
  message: string
) {
  const severity = getRuleLevel(rule, activeRulePolicy)
  if (severity == null) return

  const start = node.getStart()
  const pos = sourceFile.getLineAndColumnAtPos(start)

  findings.push({
    severity,
    rule,
    file: normalizePath(path.relative(REPORT_ROOT, sourceFile.getFilePath())),
    line: pos.line,
    column: pos.column,
    message,
    excerpt: truncateExcerpt(node.getText()),
  })
}

function sortFindings(a: AstFinding, b: AstFinding): number {
  return (
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.column - b.column ||
    a.rule.localeCompare(b.rule)
  )
}

function report(): never {
  const sorted = [...findings].sort(sortFindings)
  const format = getOutputFormat()

  if (sorted.length === 0) {
    if (format === "json") {
      console.log(
        JSON.stringify(
          { findings: [], summary: { errors: 0, warnings: 0 }, byRule: {} },
          null,
          2
        )
      )
    } else {
      console.log("✅ UI drift AST check passed. No violations found.")
    }
    process.exit(0)
  }

  if (format === "json") {
    printJsonReport(sorted)
  } else {
    printTextReport(
      sorted,
      "UI Drift AST Report",
      (f) =>
        `[${(f.severity as Severity).toUpperCase()}] ${f.rule} ${f.file}:${f.line}:${f.column}\n  ${f.message}\n  ${f.excerpt}`
    )
  }

  exitWithStatus(sorted)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(2)
})
