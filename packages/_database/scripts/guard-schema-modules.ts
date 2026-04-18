/**
 * Ensures Drizzle DDL domains use approved filenames:
 * - `*.schema.ts` for table/enum modules
 * - `_schema.ts` for `pgSchema()` handles
 * - `index.ts` barrels
 * - `shared/helpers.ts` is the only extra non-`*.schema.ts` allowed in `shared/`
 *
 * @see packages/_database/src/schema/pkg-governance/schema-modules.ts
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  DRIZZLE_MANAGED_PG_SCHEMAS,
  DRIZZLE_MIGRATIONS_SCHEMA,
} from "../src/schema/pkg-governance/constants.js"
import { isDrizzleSchemaModuleFile } from "../src/schema/pkg-governance/schema-modules.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaRoot = path.join(__dirname, "..", "src", "schema")

/** PostgreSQL namespaces with `pgTable` / enum DDL (Drizzle-managed), aligned with `schemaFilter`. */
const DDL_DOMAIN_DIRS = DRIZZLE_MANAGED_PG_SCHEMAS.filter(
  (s) => s !== DRIZZLE_MIGRATIONS_SCHEMA
)

function walkTsFiles(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    if (name === "__tests__") continue
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walkTsFiles(p, out)
    else if (name.endsWith(".ts")) out.push(p)
  }
}

function isAllowedInDomain(base: string): boolean {
  if (base === "index.ts" || base === "_schema.ts") return true
  return isDrizzleSchemaModuleFile(base)
}

function isAllowedInShared(base: string): boolean {
  if (base === "index.ts" || base === "helpers.ts") return true
  return isDrizzleSchemaModuleFile(base)
}

const violations: string[] = []

for (const domain of DDL_DOMAIN_DIRS) {
  const dir = path.join(schemaRoot, domain)
  const files: string[] = []
  walkTsFiles(dir, files)
  for (const file of files) {
    const base = path.basename(file)
    if (!isAllowedInDomain(base)) {
      violations.push(file.replace(/\\/g, "/"))
    }
  }
}

const sharedDir = path.join(schemaRoot, "shared")
const sharedFiles: string[] = []
walkTsFiles(sharedDir, sharedFiles)
for (const file of sharedFiles) {
  const base = path.basename(file)
  if (!isAllowedInShared(base)) {
    violations.push(file.replace(/\\/g, "/"))
  }
}

if (violations.length > 0) {
  console.error(
    "guard-schema-modules: disallowed .ts filename in DDL domain or shared/ (expected index.ts, _schema.ts, *.schema.ts, or shared/helpers.ts):\n" +
      violations.join("\n")
  )
  process.exit(1)
}

console.log("guard-schema-modules: ok")
