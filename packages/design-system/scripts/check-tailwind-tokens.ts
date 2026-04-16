import fs from "fs"
import path from "path"
import { fileURLToPath } from "node:url"

/** Monorepo root (`packages/design-system/scripts` → design-system → packages → root). */
const repoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
)

const ROOT = path.join(repoRoot, "apps/web/src")

/**
 * Bare numeric scale utilities (e.g. `p-4`, `h-9`) are forbidden in favor of token-backed
 * or arbitrary values. Compound utilities like `min-h-48` embed `h-48` as a substring — exclude
 * those via lookbehind so we flag real `h-*` / `w-*` usage, not `min-*` / `max-*` modifiers.
 *
 * Border: palette `border-{color}-{shade}` only — exclude side widths (`border-b-2`, etc.).
 */
const FORBIDDEN = [
  /bg-\w+-\d+/,
  /text-\w+-\d+/,
  /border-(?![tblrxy]-)\w+-\d+/,
  /\bp-\d+/,
  /\bgap-\d+/,
  /(?<!min-)(?<!max-)h-\d+/,
  /(?<!min-)(?<!max-)w-\d+/,
]

function scan(file: string) {
  const content = fs.readFileSync(file, "utf-8")

  for (const p of FORBIDDEN) {
    if (p.test(content)) {
      throw new Error(`Tailwind token violation in ${file}: ${p}`)
    }
  }
}

function walk(dir: string) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    if (fs.statSync(full).isDirectory()) walk(full)
    else if (full.endsWith(".tsx")) scan(full)
  }
}

walk(ROOT)
console.log("Tailwind token enforcement passed for", ROOT)
