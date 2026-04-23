import fs from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "./afenda-config.js"
import {
  renderGovernanceSummaryMarkdown,
  buildGovernanceAggregateReport,
  loadGovernanceDomainReports,
  loadGovernanceWaiverRegistry,
  evaluateGovernanceWaivers,
  writeGovernanceWaiverReport,
  writeJsonFile,
} from "./lib/governance-spine.js"

const config = await loadAfendaConfig()
const generatedAt = new Date()

const waiverRegistry = await loadGovernanceWaiverRegistry(
  workspaceRoot,
  config.governance.waivers.registryPath
)
const waiverReport = evaluateGovernanceWaivers(
  config,
  waiverRegistry,
  config.governance.waivers.registryPath,
  generatedAt
)
await writeGovernanceWaiverReport(workspaceRoot, config, waiverReport)

const missingReports = (
  await Promise.all(
    config.governance.domains.map(async (domain) => {
      const reportPath = path.join(workspaceRoot, domain.evidencePath)
      const exists = await fs
        .stat(reportPath)
        .then((stats) => stats.isFile())
        .catch(() => false)
      return exists ? null : domain.id
    })
  )
).filter((value): value is string => value !== null)

if (missingReports.length > 0) {
  console.error(
    `Missing governance domain evidence for: ${missingReports.join(", ")}`
  )
  process.exit(1)
}

const domainReports = await loadGovernanceDomainReports(config, workspaceRoot)
const aggregate = buildGovernanceAggregateReport(
  config,
  domainReports,
  waiverReport,
  generatedAt
)
const summary = {
  generatedAt: aggregate.generatedAt,
  ...aggregate.summary,
  waiverViolations: aggregate.waivers.violations.length,
}

await writeJsonFile(
  path.join(workspaceRoot, config.governance.evidence.aggregateReportPath),
  aggregate
)
await writeJsonFile(
  path.join(workspaceRoot, config.governance.evidence.summaryReportPath),
  summary
)
await fs.writeFile(
  path.join(
    workspaceRoot,
    config.governance.evidence.summaryReportPath.replace(/\.json$/u, ".md")
  ),
  `${renderGovernanceSummaryMarkdown(aggregate)}\n`,
  "utf8"
)

if (aggregate.summary.finalVerdict === "block") {
  console.error(
    `Governance aggregate report is blocking: ${aggregate.summary.finalVerdictExplanation}`
  )
  process.exit(1)
}

console.log(
  `Governance aggregate report written to ${config.governance.evidence.aggregateReportPath}`
)
