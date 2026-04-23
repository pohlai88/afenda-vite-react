import { loadAfendaConfig } from "./afenda-config.js"
import { evaluateGovernanceRegistry } from "./lib/governance-spine.js"

const config = await loadAfendaConfig()
const issues = evaluateGovernanceRegistry(config)

if (issues.length === 0) {
  console.log("Governance registry check passed.")
  process.exit(0)
}

console.error(`Governance registry check found ${String(issues.length)} issue(s):`)
for (const issue of issues) {
  console.error(`- [${issue.scope}] ${issue.message}`)
}

process.exit(1)
