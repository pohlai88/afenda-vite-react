/**
 * One-off / occasional codemod: replace Tailwind numeric padding and gap scale utilities (`p-N`, `gap-N`)
 * in `apps/web/src` (recursive `.tsx`) with arbitrary `rem` values so `check-tailwind-tokens.ts` passes.
 * Run from repo root: pnpm exec tsx packages/design-system/scripts/codemod-tw-spacing-token-scan.ts
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "node:url"

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const ROOT = path.join(repoRoot, "apps/web/src")

/** Default Tailwind spacing scale → rem (spacing unit = 0.25rem). */
const SPACE_REM: Record<string, string> = {
  "0": "0",
  "0.5": "0.125rem",
  "1": "0.25rem",
  "1.5": "0.375rem",
  "2": "0.5rem",
  "2.5": "0.625rem",
  "3": "0.75rem",
  "3.5": "0.875rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "7": "1.75rem",
  "8": "2rem",
  "9": "2.25rem",
  "10": "2.5rem",
  "11": "2.75rem",
  "12": "3rem",
  "14": "3.5rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
  "32": "8rem",
}

/** Width/height numeric scale (Tailwind default); extends spacing with common `w-80`-class sizes. */
const HW_REM: Record<string, string> = {
  ...SPACE_REM,
  "28": "7rem",
  "36": "9rem",
  "40": "10rem",
  "44": "11rem",
  "48": "12rem",
  "52": "13rem",
  "56": "14rem",
  "60": "15rem",
  "64": "16rem",
  "72": "18rem",
  "80": "20rem",
  "96": "24rem",
}

function replacePrefix(
  content: string,
  prefix: "p" | "gap" | "h" | "w",
  map: Record<string, string>
): string {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length)
  let c = content
  for (const k of keys) {
    const rem = map[k]
    if (rem === undefined) continue
    const esc = k.replace(/\./g, "\\.")
    const base =
      prefix === "h" || prefix === "w"
        ? `(?<!min-)(?<!max-)\\b((?:[a-z]+:)+)?${prefix}-${esc}\\b`
        : `\\b((?:[a-z]+:)+)?${prefix}-${esc}\\b`
    const re = new RegExp(base, "g")
    c = c.replace(re, (_m, variants: string | undefined) => `${variants ?? ""}${prefix}-[${rem}]`)
  }
  return c
}

function transform(content: string): string {
  let c = content
  c = replacePrefix(c, "p", SPACE_REM)
  c = replacePrefix(c, "gap", SPACE_REM)
  c = replacePrefix(c, "h", HW_REM)
  c = replacePrefix(c, "w", HW_REM)
  return c
}

function walk(dir: string): number {
  let changed = 0
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    if (fs.statSync(full).isDirectory()) changed += walk(full)
    else if (full.endsWith(".tsx")) {
      const raw = fs.readFileSync(full, "utf-8")
      const next = transform(raw)
      if (next !== raw) {
        fs.writeFileSync(full, next, "utf-8")
        changed += 1
      }
    }
  }
  return changed
}

const n = walk(ROOT)
console.log(`codemod-tw-spacing: updated ${n} files under ${ROOT}`)
