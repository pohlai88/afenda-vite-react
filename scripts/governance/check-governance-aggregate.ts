import fs from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "../config/afenda-config.js"
import type {
  GovernanceAggregateReport,
  GovernanceWaiverReport,
} from "../lib/governance-spine.js"
import {
  buildGovernanceAggregateReport,
  evaluateGovernanceWaivers,
  loadGovernanceDomainReports,
  loadGovernanceWaiverRegistry,
  renderGovernanceSummaryMarkdown,
} from "../lib/governance-spine.js"

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

const config = await loadAfendaConfig()
const waiverRegistry = await loadGovernanceWaiverRegistry(
  workspaceRoot,
  config.governance.waivers.registryPath
)
const aggregateReportPath = path.join(
  workspaceRoot,
  config.governance.evidence.aggregateReportPath
)
const summaryReportPath = path.join(
  workspaceRoot,
  config.governance.evidence.summaryReportPath
)
const summaryMarkdownPath = summaryReportPath.replace(/\.json$/u, ".md")
const waiverReportPath = path.join(
  workspaceRoot,
  config.governance.waivers.reportPath
)

const aggregateReport = JSON.parse(
  await fs.readFile(aggregateReportPath, "utf8")
) as GovernanceAggregateReport
const existingSummary = JSON.parse(
  await fs.readFile(summaryReportPath, "utf8")
) as Record<string, unknown>
const existingSummaryMarkdown = await fs.readFile(summaryMarkdownPath, "utf8")
const waiverReport = JSON.parse(
  await fs.readFile(waiverReportPath, "utf8")
) as GovernanceWaiverReport

const expectedWaiverReport = evaluateGovernanceWaivers(
  config,
  waiverRegistry,
  config.governance.waivers.registryPath,
  new Date(waiverReport.generatedAt)
)
const domainReports = await loadGovernanceDomainReports(config, workspaceRoot)
const expectedAggregate = buildGovernanceAggregateReport(
  config,
  domainReports,
  expectedWaiverReport,
  new Date(aggregateReport.generatedAt)
)
const expectedSummary = {
  generatedAt: expectedAggregate.generatedAt,
  ...expectedAggregate.summary,
  waiverViolations: expectedAggregate.waivers.violations.length,
}
const expectedSummaryMarkdown = `${renderGovernanceSummaryMarkdown(expectedAggregate)}\n`

const issues: string[] = []

if (stableJson(waiverReport) !== stableJson(expectedWaiverReport)) {
  issues.push(
    `Waiver evidence drift detected in ${config.governance.waivers.reportPath}. Run pnpm run script:check-governance-waivers or pnpm run script:sync-governance after fixing the source issue.`
  )
}

if (stableJson(aggregateReport) !== stableJson(expectedAggregate)) {
  issues.push(
    `Aggregate governance report drift detected in ${config.governance.evidence.aggregateReportPath}. Run pnpm run script:sync-governance after fixing the source issue.`
  )
}

if (stableJson(existingSummary) !== stableJson(expectedSummary)) {
  issues.push(
    `Governance summary JSON drift detected in ${config.governance.evidence.summaryReportPath}. Run pnpm run script:sync-governance after fixing the source issue.`
  )
}

if (existingSummaryMarkdown !== expectedSummaryMarkdown) {
  issues.push(
    `Governance summary markdown drift detected in ${path.relative(workspaceRoot, summaryMarkdownPath).replace(/\\/gu, "/")}. Run pnpm run script:sync-governance after fixing the source issue.`
  )
}

if (issues.length > 0) {
  console.error("Governance aggregate check found drift:")
  for (const issue of issues) {
    console.error(`- ${issue}`)
  }
  process.exit(1)
}

console.log("Governance aggregate check passed.")
