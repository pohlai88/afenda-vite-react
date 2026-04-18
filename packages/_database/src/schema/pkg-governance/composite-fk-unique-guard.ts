/**
 * Guard: PostgreSQL composite FKs require the referenced columns to have a **UNIQUE constraint**
 * (or PRIMARY KEY). Drizzle `uniqueIndex()` emits `CREATE UNIQUE INDEX`, which is **not** sufficient.
 * Use `unique()` from `drizzle-orm/pg-core` for `(tenant_id, id)` pairs that are FK targets.
 *
 * @see https://www.postgresql.org/docs/current/sql-createtable.html (REFERENCES clause)
 */
import fs from "node:fs"
import path from "node:path"

/** Matches `unique("…").on(….tenantId, ….id)` including multiline `.on(`. */
export const DRIZZLE_UNIQUE_TENANT_ID_RE =
  /unique\s*\([^)]+\)\s*\.on\s*\(\s*[^,)]+\.tenantId\s*,\s*[^,)]+\.id\s*\)/s

const FOREIGN_COLUMNS_PAIR_RE =
  /foreignColumns:\s*\[\s*([a-zA-Z_][a-zA-Z0-9_]*)\.tenantId\s*,\s*\1\.id\s*\]/gs

const EXPORT_TABLE_RE =
  /export\s+const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*[a-zA-Z_][a-zA-Z0-9_]*\.table\s*\(/g

const SELF_REF_NAMES = new Set(["table", "t"])

export type CompositeFkViolation = {
  fromFile: string
  targetSymbol: string
  targetFile: string | null
  reason: string
}

export function hasDrizzleUniqueTenantIdPair(source: string): boolean {
  return DRIZZLE_UNIQUE_TENANT_ID_RE.test(source)
}

/** Reset lastIndex when reusing global regex on same string. */
function matchesUniqueTenantId(source: string): boolean {
  const r = new RegExp(DRIZZLE_UNIQUE_TENANT_ID_RE.source, "s")
  return r.test(source)
}

export function collectExportedTableSymbols(
  filePath: string,
  source: string
): Map<string, string> {
  const m = new Map<string, string>()
  EXPORT_TABLE_RE.lastIndex = 0
  let match: RegExpExecArray | null
  const re = new RegExp(EXPORT_TABLE_RE.source, "g")
  while ((match = re.exec(source)) !== null) {
    m.set(match[1], filePath)
  }
  return m
}

export function findCompositeFkForeignColumnRefs(
  source: string
): Array<{ targetSymbol: string }> {
  const out: Array<{ targetSymbol: string }> = []
  FOREIGN_COLUMNS_PAIR_RE.lastIndex = 0
  let match: RegExpExecArray | null
  const re = new RegExp(FOREIGN_COLUMNS_PAIR_RE.source, "gs")
  while ((match = re.exec(source)) !== null) {
    out.push({ targetSymbol: match[1] })
  }
  return out
}

export function resolveTargetFileForCompositeFk(
  targetSymbol: string,
  currentFile: string,
  symbolToFile: Map<string, string>
): string | null {
  if (SELF_REF_NAMES.has(targetSymbol)) {
    return currentFile
  }
  return symbolToFile.get(targetSymbol) ?? null
}

export function auditCompositeFkUniqueConstraints(options: {
  schemaRoot: string
  extraRoots?: string[]
}): CompositeFkViolation[] {
  const roots = [options.schemaRoot, ...(options.extraRoots ?? [])].filter(Boolean)
  const files: string[] = []
  for (const root of roots) {
    walkSchemaTs(root, files)
  }

  const symbolToFile = new Map<string, string>()
  const fileContents = new Map<string, string>()

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8")
    fileContents.set(file, source)
    for (const [sym, fp] of collectExportedTableSymbols(file, source)) {
      if (!symbolToFile.has(sym)) {
        symbolToFile.set(sym, fp)
      }
    }
  }

  const violations: CompositeFkViolation[] = []
  const seen = new Set<string>()

  for (const file of files) {
    const source = fileContents.get(file)!
    const refs = findCompositeFkForeignColumnRefs(source)
    for (const { targetSymbol } of refs) {
      const dedupeKey = `${file}\0${targetSymbol}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)
      const targetFile = resolveTargetFileForCompositeFk(
        targetSymbol,
        file,
        symbolToFile
      )
      if (!targetFile) {
        violations.push({
          fromFile: file,
          targetSymbol,
          targetFile: null,
          reason: `no export const <symbol> = <schema>.table( found for "${targetSymbol}" (cannot resolve composite FK parent file)`,
        })
        continue
      }
      const targetSrc = fileContents.get(targetFile)
      if (!targetSrc) {
        violations.push({
          fromFile: file,
          targetSymbol,
          targetFile,
          reason: "target file missing from index (internal guard error)",
        })
        continue
      }
      if (!matchesUniqueTenantId(targetSrc)) {
        violations.push({
          fromFile: file,
          targetSymbol,
          targetFile,
          reason:
            'missing `unique(...).on(<row>.tenantId, <row>.id)` — PostgreSQL composite FKs cannot reference `uniqueIndex()`-only columns; use `unique()` from drizzle-orm/pg-core',
        })
      }
    }
  }

  return violations
}

function walkSchemaTs(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    if (name === "__tests__" || name === "__test__") continue
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walkSchemaTs(p, out)
    else if (name.endsWith(".schema.ts")) out.push(p)
  }
}

export function runCompositeFkUniqueGuard(databasePackageRoot: string): void {
  const schemaRoot = path.join(databasePackageRoot, "src", "schema")
  const auditRoot = path.join(databasePackageRoot, "src", "7w1h-audit")
  const violations = auditCompositeFkUniqueConstraints({
    schemaRoot,
    extraRoots: [auditRoot],
  })
  if (violations.length > 0) {
    const lines = violations.map((v) => {
      const tgt = v.targetFile?.replace(/\\/g, "/") ?? "(unresolved)"
      return `  • ${v.fromFile.replace(/\\/g, "/")}\n    → FK target symbol: ${v.targetSymbol}\n    → expected in: ${tgt}\n    → ${v.reason}`
    })
    console.error(
      "guard-composite-fk-unique-constraints: composite FK parent tables must declare `unique(...).on(.tenantId, .id)` (not only uniqueIndex).\n" +
        lines.join("\n")
    )
    process.exit(1)
  }
  console.log("guard-composite-fk-unique-constraints: ok")
}
