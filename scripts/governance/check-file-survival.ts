/**
 * Check file-survival governance rollouts for policy-blocking findings.
 * Run with `pnpm run script:check-file-survival`.
 */
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "../config/afenda-config.js"
import { generateFileSurvivalReport } from "../lib/file-survival-governance.js"
import { validateReviewedSurvivalForRollout } from "../lib/reviewed-survival-governance.js"

const requestedRolloutId = process.argv[2]?.trim() || null
const config = await loadAfendaConfig()
const rollouts = requestedRolloutId
  ? config.fileSurvival.rollouts.filter(
      (rollout) => rollout.id === requestedRolloutId
    )
  : config.fileSurvival.rollouts

if (requestedRolloutId && rollouts.length === 0) {
  throw new Error(`Unknown file-survival rollout "${requestedRolloutId}".`)
}

let blockingCount = 0

for (const rollout of rollouts) {
  const report = generateFileSurvivalReport(rollout, {
    repoRoot: workspaceRoot,
    typescriptConfigPath: path.join(
      workspaceRoot,
      "apps/web/config/tsconfig/app.json"
    ),
  })
  const reviewedSurvivalAudit = validateReviewedSurvivalForRollout(rollout, {
    repoRoot: workspaceRoot,
  })
  const blockingFindings = report.findings.filter(
    (finding) => finding.ciBlocking
  )

  if (blockingFindings.length === 0 && reviewedSurvivalAudit.issueCount === 0) {
    console.log(
      `[ok] ${rollout.id}: no policy-blocking file-survival findings (${report.rolloutStatus}, trust=${report.reportTrust})`
    )
    continue
  }

  blockingCount += blockingFindings.length
  blockingCount += reviewedSurvivalAudit.issueCount
  console.error(
    `[fail] ${rollout.id}: ${String(blockingFindings.length)} blocking file-survival finding(s) and ${String(reviewedSurvivalAudit.issueCount)} reviewed-survival issue(s) (${report.rolloutStatus}, trust=${report.reportTrust})`
  )
  for (const finding of blockingFindings.slice(0, 10)) {
    console.error(
      `  - [${finding.ruleId}] ${finding.owner} :: ${finding.path} -> ${finding.approvedRemediation.kind}`
    )
  }
  for (const issue of reviewedSurvivalAudit.issues.slice(0, 10)) {
    console.error(
      `  - [reviewed-survival:${issue.code}] ${issue.path} :: ${issue.message}`
    )
  }
}

if (blockingCount > 0) {
  process.exitCode = 1
}
