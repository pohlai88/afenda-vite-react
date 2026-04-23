import fs from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "./afenda-config.js"
import type { GovernanceAggregateReport } from "./lib/governance-spine.js"
import {
  buildGovernanceRegisterSnapshot,
  renderGovernanceRegisterMarkdown,
  writeJsonFile,
} from "./lib/governance-spine.js"

const config = await loadAfendaConfig()
const aggregateReportPath = path.join(
  workspaceRoot,
  config.governance.evidence.aggregateReportPath
)
const aggregateReport = JSON.parse(
  await fs.readFile(aggregateReportPath, "utf8")
) as GovernanceAggregateReport

const registerMarkdown = renderGovernanceRegisterMarkdown(
  config,
  aggregateReport
)
const registerPath = path.join(
  workspaceRoot,
  config.governance.evidence.registerPath
)

await fs.mkdir(path.dirname(registerPath), { recursive: true })
await fs.writeFile(registerPath, registerMarkdown, "utf8")

await writeJsonFile(
  path.join(workspaceRoot, config.governance.evidence.registerSnapshotPath),
  buildGovernanceRegisterSnapshot(config, aggregateReport)
)

console.log(
  `Governance register written to ${config.governance.evidence.registerPath}`
)
