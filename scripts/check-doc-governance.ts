import { workspaceRoot } from "./afenda-config.js"
import { evaluateDocumentationGovernance } from "./lib/doc-governance.js"

const issues = await evaluateDocumentationGovernance(workspaceRoot)

if (issues.length === 0) {
  console.log("Documentation governance check passed.")
  process.exit(0)
}

console.error(
  `Documentation governance check found ${String(issues.length)} issue(s):`
)
for (const issue of issues) {
  console.error(`- ${issue.message}`)
}

process.exit(1)
