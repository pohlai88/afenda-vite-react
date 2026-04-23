import { loadAfendaConfig, workspaceRoot } from "./afenda-config.js"
import { runGovernanceChecks } from "./lib/governance-spine.js"

const config = await loadAfendaConfig()
const result = await runGovernanceChecks(config, workspaceRoot, new Date())

if (result.warningFailures.length > 0) {
  console.warn(
    `Governance checks produced warning-level failures in: ${result.warningFailures.join(", ")}`
  )
}

if (result.blockingFailures.length > 0) {
  console.error(
    `Governance checks produced blocking failures in: ${result.blockingFailures.join(", ")}`
  )
  process.exit(1)
}

console.log(
  `Governance checks completed. Domain reports written: ${String(result.reports.length)}.`
)
