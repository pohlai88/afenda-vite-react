/**
 * Writes `docs/guideline/schema-inventory.json` from `src/schema/` and `src/7w1h-audit/` (7W1H DDL + boundary).
 * Run after any add/remove/rename under those trees (same PR as 008 / 002A updates).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.join(__dirname, "..")
const schemaRoot = path.join(pkgRoot, "src", "schema")
const sevenW1hAuditRoot = path.join(pkgRoot, "src", "7w1h-audit")
const outFile = path.join(pkgRoot, "docs", "guideline", "schema-inventory.json")

export interface SchemaInventoryPayload {
  readonly description: string
  readonly package: "@afenda/database"
  readonly roots: readonly ["src/schema", "src/7w1h-audit"]
  readonly fileCount: number
  readonly generatedAt: string
  readonly paths: readonly string[]
}

function walkFiles(dir: string, base: string, out: string[]): void {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walkFiles(p, base, out)
    else if (name.endsWith(".ts") || name.endsWith(".tsx"))
      out.push(path.relative(base, p).replace(/\\/g, "/"))
  }
}

export function buildSchemaInventoryPaths(): readonly string[] {
  const schemaPaths: string[] = []
  walkFiles(schemaRoot, schemaRoot, schemaPaths)

  const w1hPaths: string[] = []
  walkFiles(sevenW1hAuditRoot, sevenW1hAuditRoot, w1hPaths)

  return [...schemaPaths, ...w1hPaths.map((p) => `7w1h-audit/${p}`)].sort()
}

export function buildSchemaInventoryPayload(
  generatedAt = new Date().toISOString()
): SchemaInventoryPayload {
  const paths = buildSchemaInventoryPaths()

  return {
    description:
      "Authoritative list: packages/_database/src/schema/**/*.ts and src/7w1h-audit/**/*.ts — regenerate with pnpm run db:inventory:sync",
    package: "@afenda/database",
    roots: ["src/schema", "src/7w1h-audit"],
    fileCount: paths.length,
    generatedAt,
    paths,
  }
}

export function renderSchemaInventoryPayload(
  payload: SchemaInventoryPayload
): string {
  return `${JSON.stringify(payload, null, 2)}\n`
}

function run(): void {
  const payload = buildSchemaInventoryPayload()
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, renderSchemaInventoryPayload(payload), "utf8")
  console.log(
    `sync-schema-inventory: wrote ${payload.fileCount} paths → ${path.relative(pkgRoot, outFile)}`
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
}
