/**
 * Fails if `src/schema/` and `src/7w1h-audit/` on disk do not match `docs/guideline/schema-inventory.json`.
 * Run via `pnpm run db:inventory:verify` (included in `db:guard`).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.join(__dirname, "..")
const schemaRoot = path.join(pkgRoot, "src", "schema")
const sevenW1hAuditRoot = path.join(pkgRoot, "src", "7w1h-audit")
const inventoryFile = path.join(
  pkgRoot,
  "docs",
  "guideline",
  "schema-inventory.json"
)

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

if (!fs.existsSync(inventoryFile)) {
  console.error(
    "verify-schema-inventory: missing docs/guideline/schema-inventory.json — run: pnpm run db:inventory:sync"
  )
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(inventoryFile, "utf8")) as {
  paths?: string[]
}
const expected = new Set(raw.paths ?? [])

const schemaActual: string[] = []
walkFiles(schemaRoot, schemaRoot, schemaActual)
const w1hActual: string[] = []
walkFiles(sevenW1hAuditRoot, sevenW1hAuditRoot, w1hActual)
const actual = [...schemaActual, ...w1hActual.map((p) => `7w1h-audit/${p}`)]
const actualSet = new Set(actual)

const missingOnDisk = [...expected].filter((p) => !actualSet.has(p)).sort()
const notInInventory = [...actualSet].filter((p) => !expected.has(p)).sort()

if (missingOnDisk.length > 0 || notInInventory.length > 0) {
  console.error(
    "verify-schema-inventory: schema tree does not match schema-inventory.json"
  )
  if (missingOnDisk.length > 0) {
    console.error(
      "\nListed in inventory but missing on disk:\n" + missingOnDisk.join("\n")
    )
  }
  if (notInInventory.length > 0) {
    console.error(
      "\nOn disk but not in inventory (run db:inventory:sync):\n" +
        notInInventory.join("\n")
    )
  }
  process.exit(1)
}

console.log(
  `verify-schema-inventory: ok (${schemaActual.length} schema + ${w1hActual.length} 7w1h-audit = ${actual.length} files)`
)
