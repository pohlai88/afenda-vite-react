/**
 * Ensures every file under each domain `schema` folder (except `index.ts` barrels) uses the `*.schema.ts` suffix.
 * @see packages/_database/src/governance/schema-modules.ts
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { isDrizzleSchemaModuleFile } from "../src/governance/schema-modules.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.join(__dirname, "..", "src")

function walk(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (name.endsWith(".ts")) out.push(p)
  }
}

const files: string[] = []
walk(srcRoot, files)

const violations: string[] = []
for (const file of files) {
  const norm = file.replace(/\\/g, "/")
  if (!norm.includes("/schema/")) continue
  // Only direct children of a `schema` folder (not `schema/__tests__` or nested dirs).
  if (path.basename(path.dirname(file)) !== "schema") continue
  const base = path.basename(file)
  if (base === "index.ts") continue
  if (!isDrizzleSchemaModuleFile(base)) {
    violations.push(norm)
  }
}

if (violations.length > 0) {
  console.error(
    "guard-schema-modules: schema module files must end with .schema.ts (except index.ts barrels):\n" +
      violations.join("\n")
  )
  process.exit(1)
}

console.log("guard-schema-modules: ok")
