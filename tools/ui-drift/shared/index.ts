/**
 * Shared governance utilities for UI drift checkers.
 *
 * Extracted here so both the regex and AST checkers consume a single source of
 * truth for repo-root discovery, policy loading, finding types, and reporting.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export type Severity = 'error' | 'warning'
export type OutputFormat = 'text' | 'json'
export type GovernanceRuleLevel = 'error' | 'warning' | 'off'

export interface BaseFinding {
  severity: Severity
  rule: string
  file: string
  line: number
  message: string
}

export interface RegexFinding extends BaseFinding {
  text: string
}

export interface AstFinding extends BaseFinding {
  column: number
  excerpt: string
}

export interface ClassPolicyShape {
  allowDirectRadixImportOutsideUiPackage: boolean
  allowCvaOutsideUiPackage: boolean
  allowRawPaletteClasses: boolean
  allowHexRgbHslColorsInProductUi: boolean
  allowArbitraryValuesInFeatures: boolean
  allowInlineVisualStyleProps: boolean
  allowUnboundTokensInFeatures: boolean
  maxClassNameTokensInFeatures: number
}

export interface ComponentPolicyShape {
  allowFeatureLevelSemanticMaps: boolean
  allowFeatureLevelVariantDefinition: boolean
  requireGovernedComponentsInFeatures: boolean
  requireTruthMappingFromGovernedSource: boolean
}

export interface OwnershipPolicyShape {
  uiOwnerRoots: readonly string[]
  wrapperContractScanRoots: readonly string[]
  productRoots: readonly string[]
  semanticOwnerRoots: readonly string[]
  tokenOwnerFiles: readonly string[]
  inlineStyleExceptionRoots: readonly string[]
}

export interface ImportPolicyShape {
  bannedImportPatterns: readonly string[]
  allowedCnImportPaths: readonly string[]
  directRadixImportAllowlist: readonly string[]
  cvaImportAllowlist: readonly string[]
}

export interface ShadcnPolicyShape {
  requireWrappedPrimitiveConsumption: boolean
  requireDefaultShadcnStructure: boolean
  allowLocalVariantFactoryOutsideUiOwner: boolean
  allowCvaOutsideUiOwner: boolean
  requireGovernedCnHelper: boolean
  requireDataSlotAttribute: boolean
}

export interface RadixPolicyShape {
  allowDirectPrimitiveImportOutsideUiOwner: boolean
  requirePrimitiveWrappingInUiOwner: boolean
  allowAsChild: boolean
  allowCustomBehaviorForks: boolean
  allowAdHocAccessibilityOverrides: boolean
  allowedPrimitivePackages: readonly string[]
}

export interface RadixContractPolicyShape {
  requirePropsSpreadToPrimitive: boolean
  requireRefForwardingOrExplicitRefPassThrough: boolean
  requirePrimitiveRenderInWrapper: boolean
  warnOnLocalStateReplacingPrimitiveBehavior: boolean
  warnOnSuspiciousAsChildContractDrift: boolean
}

export type UtilityDomainLevel = true | 'token-only' | 'semantic-only'

export interface TailwindPolicyShape {
  requireThemeVariables: boolean
  requireSemanticColorTokens: boolean
  requireThemeInlineMapping: boolean
  allowRawPaletteClasses: boolean
  allowHardcodedHexRgbHslColorsInProductUi: boolean
  allowArbitraryValuesInFeatures: boolean
  allowInlineVisualStyleProps: boolean
  allowApplyDirective: boolean
  allowDarkVariantForSemanticColors: boolean
  allowedArbitraryValueFragments: readonly string[]
  allowedSelectorFragments: readonly string[]
  allowedUtilityDomains: {
    layout: UtilityDomainLevel
    spacing: UtilityDomainLevel
    typography: UtilityDomainLevel
    motion: UtilityDomainLevel
    borders: UtilityDomainLevel
    radius: UtilityDomainLevel
    shadows: UtilityDomainLevel
    color: UtilityDomainLevel
  }
}

export interface ReactPolicyShape {
  requirePureRender: boolean
  allowMutationDuringRender: boolean
  allowStateSetterDuringRender: boolean
  allowConditionalHookCalls: boolean
  preferLocalStateUntilShared: boolean
  preferSingleSourceOfTruthState: boolean
  allowDerivedStateCopies: boolean
  preferControlledComponentsAtBoundary: boolean
  preferEffectForExternalSyncOnly: boolean
  allowBusinessLogicDumpedIntoEffects: boolean
  preferMemoOnlyWhenMeasured: boolean
  allowBlindMemoizationEverywhere: boolean
  bannedPatterns: readonly string[]
}

export type RulePolicyShape<RuleCode extends string> = Readonly<
  Record<
    RuleCode,
    {
      level: GovernanceRuleLevel
      implemented?: boolean
    }
  >
>

export interface ShellContextPolicyShape {
  defaultShellScope: string
  requireShellProvider: boolean
  requireAuthProvider: boolean
  requireLocaleProvider: boolean
  requireThemeProvider: boolean
  requireTenantProviderInTenantScope: boolean
  requireUserProviderInTenantScope: boolean
  requireTenantIsolationBinding: boolean
  requireOperatorScopeSeparation: boolean
}

export interface AppShellPolicyShape {
  defaultZone: string
  requireShellMetadataProvider: boolean
  requireNavigationContext: boolean
  requireCommandContext: boolean
  requireLayoutDensityContext: boolean
  requireViewportAwareness: boolean
  allowFeatureLevelShellZoneFork: boolean
  allowFeatureLevelShellMetadataFork: boolean
}

export interface GovernanceModules<RuleCode extends string> {
  governanceVersion: string
  classPolicy: ClassPolicyShape
  componentPolicy: ComponentPolicyShape
  rulePolicy: RulePolicyShape<RuleCode>
  ownershipPolicy: OwnershipPolicyShape
  importPolicy: ImportPolicyShape
  shadcnPolicy: ShadcnPolicyShape
  radixPolicy: RadixPolicyShape
  radixContractPolicy: RadixContractPolicyShape
  tailwindPolicy: TailwindPolicyShape
  reactPolicy: ReactPolicyShape
  shellContextPolicy: ShellContextPolicyShape
  appShellPolicy: AppShellPolicyShape
}

export const EXPECTED_GOVERNANCE_VERSION = '1'

export const SCAN_ROOTS = ['apps', 'packages'] as const

export const EXCLUDED_DIR_NAMES = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'storybook-static',
])

export const EXCLUDED_PATH_PARTS = [
  '/node_modules/',
  '/dist/',
  '/build/',
  '/coverage/',
  '/.turbo/',
  '/storybook-static/',
] as const

export const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

export const EXCLUDE_FILE_PATTERNS = [/\.test\./, /\.spec\./, /\.stories\./] as const

export const ALLOWED_UI_OWNERS_RELATIVE = [
  'packages/shadcn-ui/src',
  'packages/ui/src',
  'packages/design-system/src/components/shadcn',
] as const

export const PRODUCT_UI_PATH_HINTS_RELATIVE = ['apps', 'packages'] as const

/**
 * Matches a well-formed inline-style exception pragma.
 * `reason` is required. `expires` is optional (YYYY-MM-DD).
 *
 * Valid forms:
 *   // @ui-drift-allow-inline-style reason="third-party lib requires it"
 *   // @ui-drift-allow-inline-style reason="chart wrapper" expires="2026-12-01"
 *
 * Malformed (missing reason, wrong format) will NOT match and will not suppress the violation.
 */
export const INLINE_STYLE_EXCEPTION_PRAGMA_RE =
  /@ui-drift-allow-inline-style\b\s+reason="[^"]*"(?:\s+expires="[^"]+")?/i

export const INLINE_STYLE_PRAGMA_EXPIRY_RE = /expires="(\d{4}-\d{2}-\d{2})"/i

/** Extract the expiry date from a pragma lookback string. Returns null if none present. */
export function extractPragmaExpiry(lookback: string): Date | null {
  const match = INLINE_STYLE_PRAGMA_EXPIRY_RE.exec(lookback)
  if (!match) return null
  const d = new Date(match[1])
  return isNaN(d.getTime()) ? null : d
}

/**
 * Returns true when the lookback text contains a valid, non-expired exception pragma.
 * An exception is invalid when:
 *   - The pragma is missing `reason`
 *   - The `expires` date is present and falls strictly before today
 */
export function isValidInlineStyleException(lookback: string, today = new Date()): boolean {
  if (!INLINE_STYLE_EXCEPTION_PRAGMA_RE.test(lookback)) return false

  const expiry = extractPragmaExpiry(lookback)
  if (expiry !== null) {
    if (isNaN(expiry.getTime())) return false
    const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (expiryDay < todayDay) return false
  }

  return true
}

/**
 * Canonical module specifiers for governed truth-UI sources.
 * Semantic style maps in feature code must trace to one of these.
 */
export const TRUTH_UI_GOVERNED_SPECIFIERS = [
  '@afenda/core/truth-ui',
  '@afenda/core/truth',
] as const

/**
 * Regex to detect a governed truth-UI import in file content (for the regex checker).
 * Aligned with TRUTH_MAPPING_IMPORT_SOURCES used by the AST checker.
 */
export const TRUTH_UI_IMPORT_RE =
  /from\s+["'](?:@afenda\/core\/truth(?:-ui)?|@afenda\/ui\/(?:semantic|truth-mapping)|@afenda\/shadcn-ui\/(?:semantic|lib\/constant))['"]/

export const GOVERNED_COMPONENT_NAMES = new Set([
  'Alert',
  'AlertDialog',
  'AllocationBadge',
  'Avatar',
  'Badge',
  'Button',
  'Calendar',
  'Card',
  'Checkbox',
  'Command',
  'Dialog',
  'Drawer',
  'DropdownMenu',
  'Form',
  'Input',
  'InvariantAlert',
  'InvariantBadge',
  'Label',
  'ReconciliationAlert',
  'SemanticAlert',
  'SemanticBadge',
  'SemanticField',
  'SemanticPanel',
  'SemanticSection',
  'Popover',
  'Progress',
  'RadioGroup',
  'ScrollArea',
  'Select',
  'Separator',
  'SettlementBadge',
  'Sheet',
  'Skeleton',
  'Slider',
  'Switch',
  'Table',
  'Tabs',
  'Textarea',
  'Toast',
  'Tooltip',
])

export const RAW_ELEMENT_NAMES = new Set([
  'div',
  'span',
  'section',
  'article',
  'aside',
  'header',
  'footer',
  'main',
  'nav',
  'ul',
  'ol',
  'li',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
])

export const UNBOUND_SPACING_TOKENS_RE =
  /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y)-(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|px)\b/

export const UNBOUND_RADIUS_TOKENS_RE =
  /\b(?:rounded|rounded-t|rounded-r|rounded-b|rounded-l|rounded-tl|rounded-tr|rounded-br|rounded-bl|rounded-s|rounded-e|rounded-ss|rounded-se|rounded-es|rounded-ee)-(?:none|sm|md|lg|xl|2xl|3xl|full)\b/

export const UNBOUND_TYPOGRAPHY_TOKENS_RE =
  /\b(?:text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|leading-(?:none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)|tracking-(?:tighter|tight|normal|wide|wider|widest))\b/

export const TAILWIND_UTILITY_RE =
  /\b(?:flex|grid|block|inline|hidden|absolute|relative|fixed|sticky|static|overflow|z-|w-|h-|min-|max-|p-|px-|py-|pt-|pr-|pb-|pl-|m-|mx-|my-|mt-|mr-|mb-|ml-|gap-|space-|text-|font-|leading-|tracking-|bg-|border|rounded|shadow|ring|opacity|transition|duration|ease|delay|animate|cursor|select|resize|list|appearance|outline|accent|caret|scroll|snap|touch|will-change|content-|items-|justify-|self-|place-|order|grow|shrink|basis|col-|row-|auto-|grid-cols|grid-rows|object-|aspect-|break-|hyphens|whitespace|decoration-|underline|overline|line-through|no-underline|indent|align|capitalize|uppercase|lowercase|normal-case|truncate|line-clamp|sr-only|not-sr-only)\b/

export const FEATURE_PATH_PATTERN = /[/\\]features?[/\\]/i

export const GOVERNED_UI_IMPORT_SOURCES = [
  '@afenda/ui',
  '@afenda/shadcn-ui',
  '@afenda/shadcn-ui/semantic',
  '@/components/ui',
  '~/components/ui',
  '../components/ui',
  '../../components/ui',
] as const

export const TRUTH_MAPPING_IMPORT_SOURCES = [
  '@afenda/ui/semantic',
  '@afenda/ui/truth-mapping',
  '@afenda/shadcn-ui/semantic',
  '@afenda/shadcn-ui/lib/constant',
  'packages/shadcn-ui/src/lib/constant',
] as const

export function normalizePath(value: string): string {
  return value.replace(/\\/g, '/').replace(/\/+$/, '')
}

export function truncateExcerpt(text: string, max = 180): string {
  const singleLine = text.replace(/\s+/g, ' ').trim()
  return singleLine.length <= max ? singleLine : `${singleLine.slice(0, max)}…`
}

export function findRepoRoot(startDir = process.cwd()): string {
  let current = path.resolve(startDir)

  while (true) {
    const markers = [
      path.join(current, 'scripts', 'afenda.config.json'),
      path.join(current, 'pnpm-workspace.yaml'),
      path.join(current, '.git'),
    ]

    if (markers.some((marker) => existsSync(marker))) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) {
      console.error(
        'Unable to locate repo root (expected scripts/afenda.config.json, pnpm-workspace.yaml, or .git).',
      )
      process.exit(2)
    }

    current = parent
  }
}

export function validateScanRoots(rootDir: string): void {
  const missing = SCAN_ROOTS.filter(
    (scanPath) => !existsSync(path.join(rootDir, scanPath)),
  )

  if (missing.length > 0) {
    console.error(
      `UI drift scan root(s) do not exist:\n${missing.map((r) => `  - ${r}`).join('\n')}`,
    )
    process.exit(2)
  }
}

export function* walkFilesRecursive(dir: string): Generator<string> {
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue
      yield* walkFilesRecursive(fullPath)
      continue
    }

    yield fullPath
  }
}

export function listFilesForScan(rootDir: string): string[] {
  validateScanRoots(rootDir)

  const files: string[] = []

  for (const scanPath of SCAN_ROOTS) {
    const absolutePath = path.join(rootDir, scanPath)
    if (!existsSync(absolutePath) || !statSync(absolutePath).isDirectory()) continue

    for (const file of walkFilesRecursive(absolutePath)) {
      if (shouldSkipFile(file)) continue
      files.push(file)
    }
  }

  return files
}

export function shouldSkipFile(absoluteFile: string): boolean {
  const normalized = normalizePath(absoluteFile)
  const ext = path.extname(normalized)

  if (!CODE_EXTENSIONS.has(ext)) return true
  if (EXCLUDE_FILE_PATTERNS.some((pattern) => pattern.test(normalized))) return true
  if (EXCLUDED_PATH_PARTS.some((part) => normalized.includes(part))) return true

  return false
}

export function isGovernedUiOwner(file: string, rootDir: string): boolean {
  const normalized = normalizePath(file)
  return ALLOWED_UI_OWNERS_RELATIVE.some((prefix) => {
    const relativePrefix = normalizePath(prefix)
    const absolutePrefix = normalizePath(path.join(rootDir, prefix))
    return normalized.startsWith(relativePrefix) || normalized.startsWith(absolutePrefix)
  })
}

export function isProductUiFile(file: string): boolean {
  const normalized = normalizePath(file)
  return PRODUCT_UI_PATH_HINTS_RELATIVE.some((prefix) => normalized.includes(`/${prefix}/`) || normalized.startsWith(prefix))
}

export function isFeatureFile(file: string): boolean {
  return FEATURE_PATH_PATTERN.test(file)
}

export function countTailwindTokens(className: string): number {
  const tokens = className.split(/\s+/).filter((t) => t.length > 0)
  return tokens.filter((token) => TAILWIND_UTILITY_RE.test(token)).length
}

export function hasUnboundSpacingTokens(className: string): boolean {
  return UNBOUND_SPACING_TOKENS_RE.test(className)
}

export function hasUnboundRadiusTokens(className: string): boolean {
  return UNBOUND_RADIUS_TOKENS_RE.test(className)
}

export function hasUnboundTypographyTokens(className: string): boolean {
  return UNBOUND_TYPOGRAPHY_TOKENS_RE.test(className)
}

export function hasAnyUnboundTokens(className: string): boolean {
  return (
    hasUnboundSpacingTokens(className) ||
    hasUnboundRadiusTokens(className) ||
    hasUnboundTypographyTokens(className)
  )
}

export function getRuleLevel<RuleCode extends string>(
  rule: RuleCode,
  rulePolicy: RulePolicyShape<RuleCode>,
): Severity | null {
  const level = rulePolicy[rule]?.level ?? 'error'
  return level === 'off' ? null : level
}

export function getOutputFormat(): OutputFormat {
  const arg = process.argv.find((entry) => entry.startsWith('--format='))
  return arg === '--format=json' ? 'json' : 'text'
}

export function buildRuleCounts<F extends { rule: string }>(items: F[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item.rule] = (counts[item.rule] ?? 0) + 1
  }
  return counts
}

export function lineNumberAt(content: string, index: number): number {
  let line = 1
  for (let i = 0; i < index; i += 1) {
    if (content.charCodeAt(i) === 10) line += 1
  }
  return line
}

export function forEachMatch(
  content: string,
  regex: RegExp,
  fn: (match: RegExpExecArray, index: number) => void,
): void {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`
  const re = new RegExp(regex.source, flags)

  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    fn(match, match.index)
  }
}

export async function loadGovernanceModules<RuleCode extends string>(
  rootDir: string,
): Promise<GovernanceModules<RuleCode>> {
  const constantLayerUrl = pathToFileURL(
    path.join(rootDir, 'packages/shadcn-ui/src/lib/constant/index.ts'),
  ).href
  const validatorUrl = pathToFileURL(
    path.join(rootDir, 'packages/shadcn-ui/src/lib/constant/validate-constants.ts'),
  ).href

  const constantLayerModule = (await import(constantLayerUrl)) as {
    governanceVersion?: string
    classPolicy?: ClassPolicyShape
    componentPolicy?: ComponentPolicyShape
    uiDriftRulePolicy?: RulePolicyShape<RuleCode>
    ownershipPolicy?: OwnershipPolicyShape
    importPolicy?: ImportPolicyShape
    shadcnPolicy?: ShadcnPolicyShape
    radixPolicy?: RadixPolicyShape
    radixContractPolicy?: RadixContractPolicyShape
    tailwindPolicy?: TailwindPolicyShape
    reactPolicy?: ReactPolicyShape
    shellContextPolicy?: ShellContextPolicyShape
    appShellPolicy?: AppShellPolicyShape
  }
  const validatorModule = (await import(validatorUrl)) as {
    validateConstantLayer?: () => void
  }

  const governanceVersion = constantLayerModule.governanceVersion
  const classPolicy = constantLayerModule.classPolicy
  const componentPolicy = constantLayerModule.componentPolicy
  const rulePolicy = constantLayerModule.uiDriftRulePolicy
  const ownershipPolicy = constantLayerModule.ownershipPolicy
  const importPolicy = constantLayerModule.importPolicy
  const shadcnPolicy = constantLayerModule.shadcnPolicy
  const radixPolicy = constantLayerModule.radixPolicy
  const radixContractPolicy = constantLayerModule.radixContractPolicy
  const tailwindPolicy = constantLayerModule.tailwindPolicy
  const reactPolicy = constantLayerModule.reactPolicy
  const shellContextPolicy = constantLayerModule.shellContextPolicy
  const appShellPolicy = constantLayerModule.appShellPolicy
  const validateConstantLayer = validatorModule.validateConstantLayer

  if (
    governanceVersion == null ||
    classPolicy == null ||
    componentPolicy == null ||
    rulePolicy == null ||
    ownershipPolicy == null ||
    importPolicy == null ||
    shadcnPolicy == null ||
    radixPolicy == null ||
    radixContractPolicy == null ||
    tailwindPolicy == null ||
    reactPolicy == null ||
    shellContextPolicy == null ||
    appShellPolicy == null ||
    validateConstantLayer == null
  ) {
    console.error('Unable to load the governed constant layer.')
    process.exit(2)
  }

  if (governanceVersion !== EXPECTED_GOVERNANCE_VERSION) {
    console.error(
      `Governance version mismatch. Expected ${EXPECTED_GOVERNANCE_VERSION}, got ${String(governanceVersion)}.`,
    )
    process.exit(2)
  }

  validateConstantLayer()

  return {
    governanceVersion,
    classPolicy,
    componentPolicy,
    rulePolicy,
    ownershipPolicy,
    importPolicy,
    shadcnPolicy,
    radixPolicy,
    radixContractPolicy,
    tailwindPolicy,
    reactPolicy,
    shellContextPolicy,
    appShellPolicy,
  }
}

export function isGovernedUiOwnerByPolicy(
  file: string,
  rootDir: string,
  uiOwnerRoots: readonly string[],
): boolean {
  const normalized = normalizePath(file)
  return uiOwnerRoots.some((prefix) => {
    const relativePrefix = normalizePath(prefix)
    const absolutePrefix = normalizePath(path.join(rootDir, prefix))
    return normalized.startsWith(relativePrefix) || normalized.startsWith(absolutePrefix)
  })
}

export function isSemanticOwnerByPolicy(
  file: string,
  rootDir: string,
  semanticOwnerRoots: readonly string[],
): boolean {
  return isGovernedUiOwnerByPolicy(file, rootDir, semanticOwnerRoots)
}

export function isInlineStyleExceptionByPolicy(
  file: string,
  rootDir: string,
  inlineStyleExceptionRoots: readonly string[],
): boolean {
  return isGovernedUiOwnerByPolicy(file, rootDir, inlineStyleExceptionRoots)
}

export function isAllowedArbitraryValueByPolicy(
  value: string,
  allowedFragments: readonly string[],
): boolean {
  if (allowedFragments.some((fragment) => value.includes(fragment))) return true

  const CSS_KEYWORD_ARBITRARY_RE =
    /\[(?:inherit|unset|initial|revert|revert-layer|currentColor)\]/
  return CSS_KEYWORD_ARBITRARY_RE.test(value)
}

export function listFilesForScanByPolicy(
  rootDir: string,
  scanRoots: readonly string[],
): string[] {
  const missing = scanRoots.filter(
    (scanPath) => !existsSync(path.join(rootDir, scanPath)),
  )

  if (missing.length > 0) {
    console.error(
      `UI drift scan root(s) do not exist:\n${missing.map((r) => `  - ${r}`).join('\n')}`,
    )
    process.exit(2)
  }

  const files: string[] = []

  for (const scanPath of scanRoots) {
    const absolutePath = path.join(rootDir, scanPath)
    if (!existsSync(absolutePath) || !statSync(absolutePath).isDirectory()) continue

    for (const file of walkFilesRecursive(absolutePath)) {
      if (shouldSkipFile(file)) continue
      files.push(file)
    }
  }

  return files
}

export function printJsonReport<F extends BaseFinding>(findings: F[]): void {
  const errors = findings.filter((f) => f.severity === 'error')
  const warnings = findings.filter((f) => f.severity === 'warning')

  console.log(
    JSON.stringify(
      {
        findings,
        summary: {
          errors: errors.length,
          warnings: warnings.length,
        },
        byRule: buildRuleCounts(findings),
      },
      null,
      2,
    ),
  )
}

export function printTextReport<F extends BaseFinding>(
  findings: F[],
  title: string,
  formatFinding: (finding: F) => string,
): void {
  const errors = findings.filter((f) => f.severity === 'error')
  const warnings = findings.filter((f) => f.severity === 'warning')

  console.log(title)
  console.log('='.repeat(title.length) + '\n')

  for (const finding of findings) {
    console.log(formatFinding(finding))
    console.log('')
  }

  console.log('Summary')
  console.log('-------')
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warnings.length}`)
  console.log('\nBy rule')
  console.log('-------')
  for (const [rule, count] of Object.entries(buildRuleCounts(findings)).sort()) {
    console.log(`${rule}: ${count}`)
  }
}

export function exitWithStatus<F extends BaseFinding>(findings: F[]): never {
  const hasErrors = findings.some((f) => f.severity === 'error')
  process.exit(hasErrors ? 1 : 0)
}
