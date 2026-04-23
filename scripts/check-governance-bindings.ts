import { loadAfendaConfig, workspaceRoot } from "./afenda-config.js"
import { evaluateGovernanceBindings } from "./lib/governance-spine.js"

const config = await loadAfendaConfig()
const issues = await evaluateGovernanceBindings(config, workspaceRoot)

if (issues.length === 0) {
  console.log("Governance bindings check passed.")
  process.exit(0)
}

console.error(`Governance bindings check found ${String(issues.length)} issue(s):`)
for (const issue of issues) {
  console.error(`- [${issue.scope}] ${issue.message}`)
}

process.exit(1)
