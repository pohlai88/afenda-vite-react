/**
 * Stem Synchronization Check
 *
 * Parses `@theme static { ... }` from `theme-tokens-light.css` to extract all
 * `--color-*` variable declarations and compares them against the
 * `SEMANTIC_COLOR_STEMS` allowlist in the ESLint plugin.
 *
 * Reports:
 *   UNGUARDED — stems in @theme inline but not in the allowlist
 *               (new tokens without lint coverage — lint won't catch misuse)
 *   STALE     — stems in the allowlist but not in @theme inline
 *               (dead references — lint will flag valid code incorrectly)
 *
 * Exit code 1 if any UNGUARDED stems are found (these are silent lint holes).
 * STALE entries are reported as warnings only.
 */
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const repoRoot = join(__dirname, "..", "..")

const { SEMANTIC_COLOR_STEMS } =
  require("../packages/eslint-config/afenda-ui-plugin/semantic-color-stems.cjs") as {
    SEMANTIC_COLOR_STEMS: Set<string>
  }

// ── Parse @theme static from theme-tokens-light.css ───────────────────────────

const cssPath = join(
  repoRoot,
  "packages",
  "design-system",
  "design-architecture",
  "src",
  "theme",
  "theme-tokens-light.css"
)
const css = readFileSync(cssPath, "utf8")

/**
 * Extracts all `--color-*` stems from the first `@theme static { ... }` block.
 * Handles nested braces (e.g. Tailwind font definitions within @theme).
 */
function extractThemeInlineStems(source: string): Set<string> {
  const stems = new Set<string>()

  // Find the @theme static block (canonical light `--color-*` keys)
  const themeStart = source.indexOf("@theme static {")
  if (themeStart === -1) {
    console.error(
      'ERROR: Could not find "@theme static {" in theme-tokens-light.css'
    )
    process.exit(1)
  }

  // Walk forward to find the matching closing brace
  let depth = 0
  let inBlock = false
  let blockContent = ""
  for (let i = themeStart; i < source.length; i++) {
    const ch = source[i]
    if (ch === "{") {
      depth++
      inBlock = true
    } else if (ch === "}") {
      depth--
      if (depth === 0 && inBlock) break
    }
    if (inBlock) blockContent += ch
  }

  // Extract --color-* declarations
  const colorVarRe = /--color-([\w-]+)\s*:/g
  let match: RegExpExecArray | null
  while ((match = colorVarRe.exec(blockContent)) !== null) {
    stems.add(match[1])
  }

  return stems
}

const themeStems = extractThemeInlineStems(css)
const allowlistStems = SEMANTIC_COLOR_STEMS

// ── Compare ───────────────────────────────────────────────────────────────────

const unguarded: string[] = [] // in @theme but NOT in allowlist
const stale: string[] = [] // in allowlist but NOT in @theme

for (const stem of themeStems) {
  if (!allowlistStems.has(stem)) {
    unguarded.push(stem)
  }
}
for (const stem of allowlistStems) {
  if (!themeStems.has(stem)) {
    stale.push(stem)
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

let hasErrors = false

if (unguarded.length > 0) {
  hasErrors = true
  console.error(
    `\n[UNGUARDED] ${unguarded.length} color stem(s) in @theme static but missing from SEMANTIC_COLOR_STEMS:`
  )
  console.error(
    "  These stems have no lint coverage — the semantic-token-allowlist rule will not"
  )
  console.error("  catch misuse of these tokens. Add them to:")
  console.error(
    "  packages/eslint-config/afenda-ui-plugin/semantic-color-stems.cjs"
  )
  console.error(
    "  (or add --color-* to theme-tokens-light.css @theme static if intentional)\n"
  )
  for (const stem of unguarded.sort()) {
    console.error(`  UNGUARDED  '${stem}'`)
  }
}

if (stale.length > 0) {
  console.warn(
    `\n[STALE] ${stale.length} color stem(s) in SEMANTIC_COLOR_STEMS but missing from @theme static:`
  )
  console.warn(
    "  These stems will cause false positives in the semantic-token-allowlist rule."
  )
  console.warn(
    "  If the token was removed from the theme, remove it from the allowlist too:"
  )
  console.warn(
    "  packages/eslint-config/afenda-ui-plugin/semantic-color-stems.cjs\n"
  )
  for (const stem of stale.sort()) {
    console.warn(`  STALE      '${stem}'`)
  }
}

if (!hasErrors && stale.length === 0) {
  console.log(
    `[OK] ${themeStems.size} @theme static stems — all accounted for in SEMANTIC_COLOR_STEMS (${allowlistStems.size} total)`
  )
}

if (hasErrors) {
  process.exit(1)
}
