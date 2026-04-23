/**
 * Writes shell governance JSON under `.artifacts/reports/shell-governance/`
 * (see docs/REPO_ARTIFACT_POLICY.md). Exit code 1 when invariants fail.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { collectShellRouteCatalogIssues } from "../services/assert-shell-route-catalog"
import { collectShellResolutionCoverageIssues } from "../services/assert-shell-resolution-coverage"
import { buildShellResolutionTrace } from "../services/build-shell-resolution-trace"
import { buildShellValidationTraceSamples } from "../services/build-shell-validation-trace-samples"
import { diffShellValidationReports } from "../services/shell-validation-report-diff"
import { formatShellValidationReportDiff } from "../services/format-shell-validation-report-diff"
import type { ShellValidationReport } from "../services/shell-validation-report"
import { buildShellValidationReport } from "../services/shell-validation-report"
import { shellRouteMetadataList } from "../routes/shell-route-definitions"

const scriptDir = dirname(fileURLToPath(import.meta.url))
/** `shell/scripts` → monorepo root (`apps/web/src/app/_platform/shell/scripts` → 7× `..`). */
const repoRoot = join(scriptDir, "../../../../../../../")
const outDir = join(repoRoot, ".artifacts/reports/shell-governance")
const outFile = join(outDir, "shell-metadata-validation-report.json")
const diffFile = join(outDir, "shell-metadata-validation-report.diff.json")

function main(): void {
  const samples = buildShellValidationTraceSamples(shellRouteMetadataList)

  const tracePathnames = [
    ...new Set([
      ...samples.required.map((e) => e.pathname),
      ...samples.negativeControls.map((e) => e.pathname),
    ]),
  ].sort((a, b) => a.localeCompare(b))

  const resolutionTrace = buildShellResolutionTrace({
    pathnames: tracePathnames,
    routeCatalog: shellRouteMetadataList,
  })

  const issues = [
    ...collectShellRouteCatalogIssues(shellRouteMetadataList),
    ...collectShellResolutionCoverageIssues(resolutionTrace, samples),
  ]

  const report = buildShellValidationReport(
    shellRouteMetadataList.length,
    issues,
    {
      resolutionTrace,
      traceSamples: samples,
    }
  )

  mkdirSync(outDir, { recursive: true })

  writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`, "utf8")

  if (report.issueCount > 0) {
    console.error(
      `Shell invariant validation failed: ${report.issueCount} issue(s). Report: ${outFile}`
    )
    process.exitCode = 1
  } else {
    console.info(`Shell invariant validation ok. Report: ${outFile}`)
  }

  const baselinePath = process.env.SHELL_GOVERNANCE_BASELINE_PATH
  if (baselinePath) {
    if (!existsSync(baselinePath)) {
      console.warn(
        `SHELL_GOVERNANCE_BASELINE_PATH is set but file not found: ${baselinePath}`
      )
    } else {
      const previous = JSON.parse(
        readFileSync(baselinePath, "utf8")
      ) as ShellValidationReport
      const diff = diffShellValidationReports(previous, report)
      writeFileSync(diffFile, `${JSON.stringify(diff, null, 2)}\n`, "utf8")

      if (diff.hasBreakingChanges) {
        console.error(formatShellValidationReportDiff(diff))
        console.error("")
        console.error(JSON.stringify(diff, null, 2))
        console.error(
          `Shell governance regression vs baseline (see ${diffFile}). Baseline: ${baselinePath}`
        )
        process.exitCode = 1
      } else {
        console.info(
          `Shell governance diff ok vs baseline. Diff artifact: ${diffFile}`
        )
      }
    }
  }
}

main()
