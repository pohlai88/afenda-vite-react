/**
 * Generate file-survival governance reports for configured rollout scopes.
 * Run with `pnpm run script:generate-file-survival-report`.
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "./afenda-config.js"
import { fileSurvivalReportsDir } from "./lib/artifact-paths.js"
import {
  generateFileSurvivalReport,
  renderFileSurvivalHtmlPreview,
  renderFileSurvivalMarkdownReport,
} from "./lib/file-survival-governance.js"
import { validateReviewedSurvivalForRollout } from "./lib/reviewed-survival-governance.js"

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

const reportsDirectory = fileSurvivalReportsDir(workspaceRoot)
await mkdir(reportsDirectory, { recursive: true })

for (const rollout of rollouts) {
  const report = generateFileSurvivalReport(rollout, {
    repoRoot: workspaceRoot,
    typescriptConfigPath: path.join(
      workspaceRoot,
      "apps/web/config/tsconfig/app.json"
    ),
  })
  const markdownPath = path.join(reportsDirectory, `${rollout.id}.md`)
  const jsonPath = path.join(reportsDirectory, `${rollout.id}.json`)
  const blockingJsonPath = path.join(
    reportsDirectory,
    `${rollout.id}-blocking.json`
  )
  const htmlPreviewPath = path.join(reportsDirectory, `${rollout.id}-preview.html`)
  const reviewedSurvivalJsonPath = path.join(
    reportsDirectory,
    `${rollout.id}-reviewed-survival.json`
  )
  const blockingFindings = report.findings.filter((finding) => finding.ciBlocking)
  const blockingOwners = report.ownerAccountability.filter(
    (entry) => entry.blockingFindingCount > 0
  )
  const reviewedSurvivalAudit = validateReviewedSurvivalForRollout(rollout, {
    repoRoot: workspaceRoot,
  })

  await writeFile(markdownPath, renderFileSurvivalMarkdownReport(report), "utf8")
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
  await writeFile(
    blockingJsonPath,
    `${JSON.stringify(
      {
        rolloutId: report.rolloutId,
        rolloutStatus: report.rolloutStatus,
        reportTrust: report.reportTrust,
        blockingFindingCount: blockingFindings.length,
        blockingOwners,
        findings: blockingFindings,
      },
      null,
      2
    )}\n`,
    "utf8"
  )
  await writeFile(htmlPreviewPath, renderFileSurvivalHtmlPreview(report), "utf8")
  await writeFile(
    reviewedSurvivalJsonPath,
    `${JSON.stringify(reviewedSurvivalAudit, null, 2)}\n`,
    "utf8"
  )

  console.log(`File survival report written: ${markdownPath}`)
  console.log(`File survival report written: ${jsonPath}`)
  console.log(`File survival blocking export written: ${blockingJsonPath}`)
  console.log(`File survival preview written: ${htmlPreviewPath}`)
  console.log(`Reviewed survival audit written: ${reviewedSurvivalJsonPath}`)
}
