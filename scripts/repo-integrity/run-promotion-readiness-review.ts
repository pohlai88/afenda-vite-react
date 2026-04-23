import fs from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "../afenda-config.js"
import type { RepoGuardEvidenceReport } from "../lib/repo-guard.js"
import {
  evaluatePromotionReadiness,
  formatPromotionReadinessHumanReport,
  formatPromotionReadinessMarkdownReport,
} from "../lib/repo-guard-promotion-readiness.js"

const config = await loadAfendaConfig()
const args = new Set(process.argv.slice(2))
const writeReport = args.has("--report") || args.has("--ci")
const repoGuardEvidencePath = path.join(
  workspaceRoot,
  ".artifacts/reports/governance/repo-integrity-guard.report.json"
)
const repoGuardReport = JSON.parse(
  await fs.readFile(repoGuardEvidencePath, "utf8")
) as RepoGuardEvidenceReport

const report = await evaluatePromotionReadiness({
  repoRoot: workspaceRoot,
  config,
  repoGuardReport,
})

if (writeReport) {
  const jsonPath = path.join(
    workspaceRoot,
    ".artifacts/reports/governance/repo-guard-promotion-readiness.report.json"
  )
  const markdownPath = path.join(
    workspaceRoot,
    ".artifacts/reports/governance/repo-guard-promotion-readiness.report.md"
  )
  await fs.mkdir(path.dirname(jsonPath), { recursive: true })
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
  await fs.writeFile(
    markdownPath,
    `${formatPromotionReadinessMarkdownReport(report)}\n`,
    "utf8"
  )
}

console.log(formatPromotionReadinessHumanReport(report))

if (args.has("--ci")) {
  process.exit(report.status === "fail" ? 1 : 0)
}
