import fs from "node:fs/promises"
import path from "node:path"

import { workspaceRoot } from "./afenda-config.js"
import { evaluateNamingConvention } from "./lib/naming-convention.js"

const packageJsonPath = path.join(workspaceRoot, "package.json")
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as {
  readonly scripts?: Record<string, string>
}

const result = evaluateNamingConvention(
  workspaceRoot,
  packageJson.scripts ?? {}
)

for (const warning of result.warnings) {
  console.warn(`WARN [${warning.rule}] ${warning.path}: ${warning.message}`)
}

if (result.errors.length === 0) {
  console.log(
    `Naming convention check passed with ${String(result.warnings.length)} warning(s).`
  )
  process.exit(0)
}

console.error(
  `Naming convention check found ${String(result.errors.length)} blocking issue(s):`
)
for (const issue of result.errors) {
  console.error(`- [${issue.rule}] ${issue.path}: ${issue.message}`)
}

process.exit(1)
