import fs from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "../config/afenda-config.js"
import type {
  GovernanceAggregateReport,
  GovernanceRegisterSnapshot,
} from "../lib/governance-spine.js"
import {
  buildGovernanceRegisterSnapshot,
  evaluateGovernanceRegisterConsistency,
  renderGovernanceRegisterMarkdown,
} from "../lib/governance-spine.js"

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

const config = await loadAfendaConfig()
const aggregateReport = JSON.parse(
  await fs.readFile(
    path.join(workspaceRoot, config.governance.evidence.aggregateReportPath),
    "utf8"
  )
) as GovernanceAggregateReport
const registerPath = path.join(
  workspaceRoot,
  config.governance.evidence.registerPath
)
const snapshotPath = path.join(
  workspaceRoot,
  config.governance.evidence.registerSnapshotPath
)
const registerMarkdown = await fs.readFile(registerPath, "utf8")
const snapshot = JSON.parse(
  await fs.readFile(snapshotPath, "utf8")
) as GovernanceRegisterSnapshot

const expectedMarkdown = renderGovernanceRegisterMarkdown(
  config,
  aggregateReport
)
const expectedSnapshot = buildGovernanceRegisterSnapshot(
  config,
  aggregateReport
)
const issues = evaluateGovernanceRegisterConsistency(
  config,
  aggregateReport,
  snapshot
)

if (registerMarkdown !== expectedMarkdown) {
  issues.push({
    scope: "governance.register",
    message: `Generated governance register drift detected in ${config.governance.evidence.registerPath}. Run pnpm run script:sync-governance after fixing the source issue.`,
  })
}

if (stableJson(snapshot) !== stableJson(expectedSnapshot)) {
  issues.push({
    scope: "governance.registerSnapshot",
    message: `Governance register snapshot drift detected in ${config.governance.evidence.registerSnapshotPath}. Run pnpm run script:sync-governance after fixing the source issue.`,
  })
}

if (issues.length > 0) {
  console.error("Governance register check found drift:")
  for (const issue of issues) {
    console.error(`- [${issue.scope}] ${issue.message}`)
  }
  process.exit(1)
}

console.log("Governance register check passed.")
