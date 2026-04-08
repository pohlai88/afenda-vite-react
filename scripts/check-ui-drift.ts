/**
 * CI guard: detect UI drift that bypasses the governed constant and primitive
 * layer. The checker imports policy directly from the governed constant layer
 * so the scanner enforces the same law the component system defines.
 *
 * Usage:
 *   pnpm run script:check-ui-drift
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import {
  type RegexFinding,
  type RulePolicyShape,
  type Severity,
  findRepoRoot,
  forEachMatch,
  getOutputFormat,
  getRuleLevel,
  isGovernedUiOwner,
  isProductUiFile,
  isValidInlineStyleException,
  lineNumberAt,
  listFilesForScan,
  loadGovernanceModules,
  normalizePath,
  printJsonReport,
  printTextReport,
  truncateExcerpt,
  exitWithStatus,
  TRUTH_UI_GOVERNED_SPECIFIERS,
  TRUTH_UI_IMPORT_RE,
} from '../tools/ui-drift/shared/index.js'

type RuleCode =
  | 'UIX-IMPORT-001'
  | 'UIX-IMPORT-002'
  | 'UIX-COLOR-001'
  | 'UIX-COLOR-002'
  | 'UIX-CLASS-001'
  | 'UIX-STYLE-001'
  | 'UIX-SEMANTIC-001'
  | 'UIX-SEMANTIC-002'
  | 'UIX-CONTROL-001'
  | 'UIX-VARIANT-001'

const ROOT_DIR = findRepoRoot()

const ARBITRARY_VALUE_ALLOWLIST = [
  /\[--/,
  /\[var\(/,
  /\[calc\(/,
  /\[(?:inherit|unset|initial|revert|revert-layer|currentColor)\]/,
]

const RAW_TAILWIND_PALETTE_RE =
  /\b(?:bg|text|border|ring|stroke|fill)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g

const HARDCODED_COLOR_RE =
  /(?:(?:^|[\s;:,{(])#[0-9a-fA-F]{3,8}\b)|(?:rgb[a]?\()|(?:hsl[a]?\()|(?:oklch\()/g

const TOKEN_BACKED_COLOR_RE = /(?:rgb[a]?|hsl[a]?|oklch|oklab|lch|lab|color)\(\s*var\(/

const ARBITRARY_VALUE_RE =
  /\b(?:w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|rounded|text|leading|tracking|top|right|bottom|left|inset|translate-x|translate-y|grid-cols|grid-rows)-\[[^\]]+\]/g

const RADIX_IMPORT_RE = /from\s+["']@radix-ui\/react-[^"']+["']/g

const CVA_IMPORT_RE = /from\s+["']class-variance-authority["']/g

const INLINE_STYLE_RE = /\bstyle=\{\{[\s\S]*?\}\}/g

const LOCAL_SEMANTIC_MAP_RE =
  /\b(?:status|severity|tone|intent|variant|color|badge|alert)(?:Class|Classes|Color|Colors|Tone|Variant|Map|Lookup)\b/g

const LOCAL_VARIANT_FACTORY_RE =
  /\b(?:cva\s*\(|defineVariants?\s*\(|createVariants?\s*\(|get[A-Z][A-Za-z0-9]+Classes\s*\()/g

const CSS_UTILITY_HINT_RE = /\b(?:bg-|text-|border-|ring-|stroke-|fill-|shadow-|rounded-)\b/

/** Non-global version of LOCAL_SEMANTIC_MAP_RE for presence checks without lastIndex drift. */
const SEMANTIC_MAP_NAME_RE_NG =
  /\b(?:status|severity|tone|intent|variant|color|badge|alert)(?:Class|Classes|Color|Colors|Tone|Variant|Map|Lookup)\b/

/** Raw form controls that must use governed component equivalents in feature code. */
const RAW_FORM_CONTROL_RE = /<(?:input|select|textarea)(?:\s|\/|>)/g

const findings: RegexFinding[] = []
let activeRulePolicy: RulePolicyShape<RuleCode>

async function main() {
  const { classPolicy, componentPolicy, rulePolicy } =
    await loadGovernanceModules<RuleCode>(ROOT_DIR)
  activeRulePolicy = rulePolicy

  for (const absoluteFile of listFilesForScan(ROOT_DIR)) {
    const relativeFile = normalizePath(path.relative(ROOT_DIR, absoluteFile))
    if (!isProductUiFile(relativeFile)) continue

    const content = safeRead(absoluteFile)
    if (content == null) continue

    if (!classPolicy.allowDirectRadixImportOutsideUiPackage) {
      checkRadixImport(relativeFile, content)
    }

    if (!classPolicy.allowCvaOutsideUiPackage) {
      checkCvaImport(relativeFile, content)
    }

    if (!classPolicy.allowRawPaletteClasses) {
      checkRawPaletteClasses(relativeFile, content)
    }

    if (!classPolicy.allowHexRgbHslColorsInProductUi) {
      checkHardcodedColors(relativeFile, content)
    }

    if (!classPolicy.allowArbitraryValuesInFeatures) {
      checkArbitraryValues(relativeFile, content)
    }

    if (!classPolicy.allowInlineVisualStyleProps) {
      checkInlineStyles(relativeFile, content)
    }

    if (!componentPolicy.allowFeatureLevelSemanticMaps) {
      checkLocalSemanticMaps(relativeFile, content)
    }

    if (componentPolicy.requireTruthMappingFromGovernedSource) {
      checkTruthUiMapping(relativeFile, content)
    }

    if (!componentPolicy.allowFeatureLevelVariantDefinition) {
      checkLocalVariantFactories(relativeFile, content)
    }

    if (componentPolicy.requireGovernedComponentsInFeatures) {
      checkRawHtmlControls(relativeFile, content)
    }
  }

  report()
}

function safeRead(file: string): string | null {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return null
  }
}

function checkRadixImport(file: string, content: string) {
  if (isGovernedUiOwner(file, ROOT_DIR)) return

  forEachMatch(content, RADIX_IMPORT_RE, (match, index) => {
    pushFinding({
      rule: 'UIX-IMPORT-001',
      file,
      line: lineNumberAt(content, index),
      text: match[0],
      message:
        'Direct @radix-ui/react-* import outside governed UI package. Use wrapped primitives only.',
    })
  })
}

function checkCvaImport(file: string, content: string) {
  if (isGovernedUiOwner(file, ROOT_DIR)) return

  forEachMatch(content, CVA_IMPORT_RE, (match, index) => {
    pushFinding({
      rule: 'UIX-IMPORT-002',
      file,
      line: lineNumberAt(content, index),
      text: match[0],
      message:
        'class-variance-authority import outside governed UI package. Variant definition must live in the UI owner package only.',
    })
  })
}

function checkRawPaletteClasses(file: string, content: string) {
  forEachMatch(content, RAW_TAILWIND_PALETTE_RE, (match, index) => {
    pushFinding({
      rule: 'UIX-COLOR-001',
      file,
      line: lineNumberAt(content, index),
      text: match[0],
      message: 'Raw Tailwind palette class found. Use token-backed semantic classes instead.',
    })
  })
}

function checkHardcodedColors(file: string, content: string) {
  forEachMatch(content, HARDCODED_COLOR_RE, (match, index) => {
    const surroundingContext = content.slice(index, index + match[0].length + 30)
    if (TOKEN_BACKED_COLOR_RE.test(surroundingContext)) return

    if (match[0].trimStart().startsWith('#') && isLikelyProseLine(content, index)) return

    pushFinding({
      rule: 'UIX-COLOR-002',
      file,
      line: lineNumberAt(content, index),
      text: match[0],
      message: 'Hardcoded color literal found. Use CSS variables / semantic tokens instead.',
    })
  })
}

function isLikelyProseLine(content: string, index: number): boolean {
  const lineStart = content.lastIndexOf('\n', index) + 1
  const lineEnd = content.indexOf('\n', index)
  const line = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)

  if (CSS_UTILITY_HINT_RE.test(line)) return false
  if (/[;{}]/.test(line)) return false

  const hashMatches = line.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
  if (hashMatches.length !== 1) return false

  const wordCount = line.trim().split(/\s+/).length
  return wordCount >= 5
}

function checkArbitraryValues(file: string, content: string) {
  forEachMatch(content, ARBITRARY_VALUE_RE, (match, index) => {
    const text = match[0]
    if (ARBITRARY_VALUE_ALLOWLIST.some((allowed) => allowed.test(text))) return

    pushFinding({
      rule: 'UIX-CLASS-001',
      file,
      line: lineNumberAt(content, index),
      text,
      message: 'Arbitrary Tailwind value found. Use governed tokens / scales instead.',
    })
  })
}

function checkInlineStyles(file: string, content: string) {
  forEachMatch(content, INLINE_STYLE_RE, (match, index) => {
    const text = match[0]
    if (hasInlineStyleException(content, index)) return

    pushFinding({
      rule: 'UIX-STYLE-001',
      file,
      line: lineNumberAt(content, index),
      text: truncateExcerpt(text, 160),
      message:
        'Inline visual style prop found. Use tokens, variants, or governed component props instead.',
    })
  })
}

function hasInlineStyleException(content: string, index: number): boolean {
  const lookback = content.slice(Math.max(0, index - 400), index)
  return isValidInlineStyleException(lookback)
}

function checkLocalSemanticMaps(file: string, content: string) {
  if (isGovernedUiOwner(file, ROOT_DIR)) return

  forEachMatch(content, LOCAL_SEMANTIC_MAP_RE, (match, index) => {
    pushFinding({
      rule: 'UIX-SEMANTIC-001',
      file,
      line: lineNumberAt(content, index),
      text: match[0],
      message:
        'Suspicious local semantic/style map found. Domain/status-to-UI mapping should live in the governed semantic/domain layer.',
    })
  })
}

/**
 * UIX-SEMANTIC-002: a semantic/status map exists in feature code AND the file has no
 * import from a governed truth-UI source (@afenda/core/truth or @afenda/core/truth-ui).
 * This upgrades SEMANTIC-001 from advisory to actionable.
 */
function checkTruthUiMapping(file: string, content: string) {
  if (isGovernedUiOwner(file, ROOT_DIR)) return
  if (!isFeatureCode(file)) return
  if (!SEMANTIC_MAP_NAME_RE_NG.test(content)) return
  if (TRUTH_UI_IMPORT_RE.test(content)) return

  const match = SEMANTIC_MAP_NAME_RE_NG.exec(content)
  if (!match) return

  pushFinding({
    rule: 'UIX-SEMANTIC-002',
    file,
    line: lineNumberAt(content, match.index),
    text: match[0],
    message: `Domain-to-UI semantic mapping found without a governed truth-UI import. Import from ${TRUTH_UI_GOVERNED_SPECIFIERS.join(' or ')} instead of building local mappings.`,
  })
}

/**
 * UIX-CONTROL-001: raw HTML form controls found in feature code.
 * Controls with governed equivalents (Input, Select, Textarea) must use those
 * equivalents. Scoped to features/ only to avoid false positives in shared layers.
 */
function checkRawHtmlControls(file: string, content: string) {
  if (isGovernedUiOwner(file, ROOT_DIR)) return
  if (!isFeatureCode(file)) return

  forEachMatch(content, RAW_FORM_CONTROL_RE, (match, index) => {
    const tagMatch = /<(\w+)/.exec(match[0])
    const tagName = tagMatch?.[1] ?? 'element'
    pushFinding({
      rule: 'UIX-CONTROL-001',
      file,
      line: lineNumberAt(content, index),
      text: match[0].trim(),
      message: `Raw <${tagName}> element in feature code. Use the governed UI component equivalent (e.g. <Input />, <Select />) from the UI package instead.`,
    })
  })
}

/** Returns true when the file path is in the application feature layer. */
function isFeatureCode(file: string): boolean {
  return normalizePath(file).includes('/features/')
}

function checkLocalVariantFactories(file: string, content: string) {
  if (isGovernedUiOwner(file, ROOT_DIR)) return

  forEachMatch(content, LOCAL_VARIANT_FACTORY_RE, (match, index) => {
    pushFinding({
      rule: 'UIX-VARIANT-001',
      file,
      line: lineNumberAt(content, index),
      text: match[0],
      message:
        'Local variant factory detected. Variant construction should live in the governed UI package.',
    })
  })
}

function pushFinding(finding: Omit<RegexFinding, 'severity'>) {
  const severity = getRuleLevel(finding.rule as RuleCode, activeRulePolicy)
  if (severity == null) return

  findings.push({
    ...finding,
    severity,
  } as RegexFinding)
}

function sortFindings(a: RegexFinding, b: RegexFinding): number {
  return a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule)
}

function report(): never {
  const sorted = [...findings].sort(sortFindings)
  const format = getOutputFormat()

  if (sorted.length === 0) {
    if (format === 'json') {
      console.log(JSON.stringify({ findings: [], summary: { errors: 0, warnings: 0 }, byRule: {} }, null, 2))
    } else {
      console.log('✅ UI drift check passed. No violations found.')
    }
    process.exit(0)
  }

  if (format === 'json') {
    printJsonReport(sorted)
  } else {
    printTextReport(sorted, 'UI Drift Report', (f) =>
      `[${(f.severity as Severity).toUpperCase()}] ${f.rule} ${f.file}:${f.line}\n  ${f.message}\n  ${f.text}`,
    )
  }

  exitWithStatus(sorted)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(2)
})
