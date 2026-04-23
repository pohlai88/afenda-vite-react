import { loadAfendaConfig, workspaceRoot } from "./afenda-config.js"
import {
  evaluateGovernanceWaivers,
  loadGovernanceWaiverRegistry,
  writeGovernanceWaiverReport,
} from "./lib/governance-spine.js"

const config = await loadAfendaConfig()
const waiverRegistry = await loadGovernanceWaiverRegistry(
  workspaceRoot,
  config.governance.waivers.registryPath
)
const report = evaluateGovernanceWaivers(
  config,
  waiverRegistry,
  config.governance.waivers.registryPath,
  new Date()
)

await writeGovernanceWaiverReport(workspaceRoot, config, report)

if (report.violations.length === 0) {
  console.log("Governance waivers check passed.")
  process.exit(0)
}

console.error(
  `Governance waivers check found ${String(report.violations.length)} issue(s):`
)
for (const violation of report.violations) {
  console.error(
    `- [${violation.waiverId}] ${violation.message} (domain ${violation.domainId})`
  )
}

process.exit(1)
