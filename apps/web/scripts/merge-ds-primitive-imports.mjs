/**
 * Merge `import ... from "@afenda/design-system/ui-primitives/<subpath>"` into
 * a single barrel import from `@afenda/design-system/ui-primitives`.
 */
/* global console, process */
import fs from "node:fs"
import path from "node:path"

const ROOT = path.join(process.cwd(), "src", "share", "components")

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) walk(p, out)
    else if (name.name.endsWith(".tsx") || name.name.endsWith(".ts"))
      out.push(p)
  }
  return out
}

const PRIMITIVE_RE =
  /^import\s+(type\s+)?\{([^}]+)\}\s+from\s+["']@afenda\/design-system\/ui-primitives\/([^"']+)["']\s*;?\s*$/

function parseNamedImports(body, entireLineIsTypeImport) {
  const names = []
  const typeNames = []
  const parts = body
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  for (const part of parts) {
    const isInlineType = /^type\s+/.test(part)
    const cleaned = part.replace(/^type\s+/, "").trim()
    const base = cleaned.replace(/\s+as\s+.+$/, "").trim()
    if (entireLineIsTypeImport || isInlineType) typeNames.push(base)
    else names.push(base)
  }
  return { names, typeNames }
}

function uniq(arr) {
  return [...new Set(arr)]
}

function mergeFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8")
  const lines = src.split(/\r?\n/)

  const allNames = []
  const allTypeNames = []
  const kept = []
  for (const line of lines) {
    const m = line.match(PRIMITIVE_RE)
    if (m) {
      const body = m[2]
      const entireLineIsTypeImport = Boolean(m[1])
      const { names, typeNames } = parseNamedImports(
        body,
        entireLineIsTypeImport
      )
      allNames.push(...names)
      allTypeNames.push(...typeNames)
      continue
    }
    kept.push(line)
  }

  if (allNames.length === 0 && allTypeNames.length === 0) return false

  const importLines = []
  const n = uniq(allNames)
  const t = uniq(allTypeNames)
  if (n.length)
    importLines.push(
      `import { ${n.join(", ")} } from "@afenda/design-system/ui-primitives"`
    )
  if (t.length)
    importLines.push(
      `import type { ${t.join(", ")} } from "@afenda/design-system/ui-primitives"`
    )

  // Prepend barrel imports after an optional `"use client"` line only. Do not splice
  // after the first `import` line — multi-line `import { ... } from "..."` blocks
  // would be split and corrupt the file.
  const result = []
  let start = 0
  if (/^["']use client["']\s*$/.test((kept[0] ?? "").trim())) {
    result.push(kept[0])
    start = 1
  }
  for (const il of importLines) result.push(il)
  for (let i = start; i < kept.length; i++) result.push(kept[i])

  const next = result.join("\n")
  if (next === src) return false
  fs.writeFileSync(filePath, next, "utf8")
  return true
}

const dirs = [path.join(ROOT, "settings"), path.join(ROOT, "user")]
let count = 0
for (const d of dirs) {
  if (!fs.existsSync(d)) continue
  for (const f of walk(d)) {
    if (mergeFile(f)) {
      count++
      console.log("merged:", path.relative(process.cwd(), f))
    }
  }
}
console.log("done, merged files:", count)
