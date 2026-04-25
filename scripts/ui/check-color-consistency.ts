/**
 * CI guard: detect raw Tailwind color classes, arbitrary color utilities,
 * hardcoded hex/rgb/hsl/oklch values, and hsl(var(--...)) drift in product UI code.
 *
 * Exits non-zero when violations are found.
 *
 * Pure Node (no ripgrep): works on Windows/macOS/Linux CI without `rg` on PATH.
 *
 * Usage:
 *   tsx scripts/ui/check-color-consistency.ts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const SCAN_PATHS = ["packages/design-system", "apps/web/src"] as const

const EXCLUDE_DIR_NAMES = new Set(["__tests__"])

/** When true, only `.ts` and `.tsx` (matches prior `rg --type code` behavior). */
const CODE_TS_TSX = new Set([".ts", ".tsx"])

const ALL_UI_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
])

type RuleName =
  | "raw-tailwind-color"
  | "arbitrary-tailwind-color"
  | "hardcoded-color"
  | "hsl-var-usage"

type Severity = "error"

interface ParsedMatch {
  file: string
  line: number
  text: string
}

interface Violation extends ParsedMatch {
  rule: RuleName
  severity: Severity
}

interface Rule {
  name: RuleName
  pattern: string
  severity: Severity
  description: string
  /** If set, restrict to these extensions; otherwise use ALL_UI_EXTENSIONS. */
  extensions?: Set<string>
  shouldSkip?: (match: ParsedMatch) => boolean
}

const violations: Violation[] = []

function fail(message: string): never {
  console.error(`\n❌ ${message}\n`)
  process.exit(1)
}

function validateScanPaths() {
  const missing = SCAN_PATHS.filter((scanPath) => !existsSync(scanPath))
  if (missing.length > 0) {
    fail(
      [
        "Color consistency scan path(s) do not exist:",
        ...missing.map((p) => `  - ${p}`),
      ].join("\n")
    )
  }
}

function normalizeReportPath(absoluteFile: string): string {
  const rel = path.relative(process.cwd(), absoluteFile)
  return rel.split(path.sep).join("/")
}

function shouldSkipFilePath(absoluteFile: string): boolean {
  const segments = absoluteFile.split(path.sep)
  for (const seg of segments) {
    if (EXCLUDE_DIR_NAMES.has(seg)) return true
  }
  const base = path.basename(absoluteFile)
  if (base.endsWith(".css")) return true
  if (
    /\.test\./.test(base) ||
    /\.spec\./.test(base) ||
    /\.stories\./.test(base)
  )
    return true
  return false
}

function* walkFilesRecursive(dir: string): Generator<string> {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (EXCLUDE_DIR_NAMES.has(entry.name)) continue
      yield* walkFilesRecursive(full)
    } else {
      yield full
    }
  }
}

function collectScanFiles(scanRoot: string): string[] {
  if (!existsSync(scanRoot)) return []
  const stat = statSync(scanRoot)
  if (!stat.isDirectory()) return []
  return [...walkFilesRecursive(scanRoot)]
}

function getCodeTextOnly(rawText: string): string {
  return rawText
}

function isCommentOnly(text: string): boolean {
  const trimmed = text.trim()
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*/")
  )
}

function isImportLine(text: string): boolean {
  return /^\s*import\s/.test(text)
}

function isAllowedColorException(match: ParsedMatch): boolean {
  const text = getCodeTextOnly(match.text)
  const normalizedFile = match.file.split(path.sep).join("/")

  /**
   * Centralized exceptions.
   *
   * Keep this list intentionally small and explicit.
   * If more exceptions are needed later, prefer file/folder-scoped allowances
   * rather than weakening the detection patterns globally.
   */

  // Allow SVG attribute selectors used for external chart/rendered DOM targeting.
  if (/\[(stroke|fill)=['"]#/.test(text)) return true

  // Allow Recharts adapter/integration edge cases in dedicated infra paths only.
  if (
    normalizedFile.includes("/chart/") ||
    normalizedFile.includes("/charts/") ||
    normalizedFile.includes("/charting/")
  ) {
    if (/\b(recharts|stroke=|fill=)\b/i.test(text)) return true
  }

  return false
}

function lineMatchesPattern(line: string, patternSource: string): boolean {
  try {
    const re = new RegExp(patternSource)
    return re.test(line)
  } catch {
    fail(`Invalid regular expression for rule pattern: ${patternSource}`)
  }
}

function collectViolationsForRule(rule: Rule) {
  const exts = rule.extensions ?? ALL_UI_EXTENSIONS

  for (const scanPath of SCAN_PATHS) {
    for (const absoluteFile of collectScanFiles(scanPath)) {
      if (shouldSkipFilePath(absoluteFile)) continue
      const ext = path.extname(absoluteFile)
      if (!exts.has(ext)) continue

      let content: string
      try {
        content = readFileSync(absoluteFile, "utf-8")
      } catch {
        continue
      }

      const reportPath = normalizeReportPath(absoluteFile)
      const lines = content.split(/\r?\n/)

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i] ?? ""
        if (!lineMatchesPattern(line, rule.pattern)) continue

        const parsed: ParsedMatch = {
          file: reportPath,
          line: i + 1,
          text: line.trim(),
        }

        if (rule.shouldSkip?.(parsed)) continue

        violations.push({
          ...parsed,
          rule: rule.name,
          severity: rule.severity,
        })
      }
    }
  }
}

const rules: Rule[] = [
  {
    name: "raw-tailwind-color",
    severity: "error",
    description:
      "Raw Tailwind palette utilities are not allowed in governed product UI code.",
    pattern: String.raw`\b(text|bg|border|ring|fill|stroke|outline|shadow|decoration|from|to|via|placeholder|caret|accent|divide|ring-offset)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(\/\d{1,3})?\b`,
    shouldSkip: isAllowedColorException,
  },
  {
    name: "arbitrary-tailwind-color",
    severity: "error",
    description:
      "Arbitrary Tailwind color utilities are not allowed; use semantic tokens/utilities instead.",
    pattern: String.raw`\b(text|bg|border|ring|fill|stroke|outline|shadow|decoration|from|to|via|placeholder|caret|accent|divide|ring-offset)-\[[^\]]*(#|rgb\(|rgba\(|hsl\(|hsla\(|oklch\()[^\]]*\]`,
    shouldSkip: isAllowedColorException,
  },
  {
    name: "hardcoded-color",
    severity: "error",
    description:
      "Hardcoded color values are not allowed in TS/TSX product UI code.",
    pattern: String.raw`(#[0-9a-fA-F]{3,8}\b|\brgb\(|\brgba\(|\bhsl\(|\bhsla\(|\boklch\()`,
    extensions: CODE_TS_TSX,
    shouldSkip: (match) => {
      const text = getCodeTextOnly(match.text)
      if (isAllowedColorException(match)) return true
      if (isCommentOnly(text)) return true
      if (isImportLine(text)) return true
      return false
    },
  },
  {
    name: "hsl-var-usage",
    severity: "error",
    description:
      "hsl(var(--...)) is not allowed in component code; use approved token mapping / OKLCH strategy instead.",
    pattern: String.raw`hsl\(var\(`,
    extensions: CODE_TS_TSX,
    shouldSkip: (match) => {
      const text = getCodeTextOnly(match.text)
      if (isCommentOnly(text)) return true
      if (isImportLine(text)) return true
      return false
    },
  },
]

function sortViolations(items: Violation[]): Violation[] {
  return [...items].sort((a, b) => {
    if (a.rule !== b.rule) return a.rule.localeCompare(b.rule)
    if (a.file !== b.file) return a.file.localeCompare(b.file)
    return a.line - b.line
  })
}

function printViolations(items: Violation[]) {
  const sorted = sortViolations(items)
  const countsByRule = new Map<RuleName, number>()

  for (const item of sorted) {
    countsByRule.set(item.rule, (countsByRule.get(item.rule) ?? 0) + 1)
  }

  console.error(`\n❌ Found ${sorted.length} color consistency violation(s):\n`)

  for (const rule of rules) {
    const count = countsByRule.get(rule.name) ?? 0
    if (count === 0) continue

    console.error(`Rule: ${rule.name} (${count})`)
    console.error(`  ${rule.description}\n`)

    const ruleViolations = sorted.filter((v) => v.rule === rule.name)
    let currentFile = ""

    for (const violation of ruleViolations) {
      if (violation.file !== currentFile) {
        currentFile = violation.file
        console.error(`  File: ${currentFile}`)
      }
      console.error(`    ${violation.line}: ${violation.text}`)
    }

    console.error("")
  }

  console.error("Fix:")
  console.error(
    "  - Use semantic utilities such as bg-background, text-foreground, border-border."
  )
  console.error(
    "  - Use approved product tokens instead of raw palette classes or hardcoded values."
  )
  console.error(
    "  - Do not use arbitrary Tailwind color values in product UI code."
  )
  console.error("")
  console.error("Docs:")
  console.error("  - docs/COMPONENTS_AND_STYLING.md § Token and Theming Rules")
  console.error("")
}

function main() {
  validateScanPaths()

  for (const rule of rules) {
    collectViolationsForRule(rule)
  }

  if (violations.length > 0) {
    printViolations(violations)
    process.exit(1)
  }

  console.log("✅ No color consistency violations found.")
}

main()
