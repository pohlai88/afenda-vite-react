/**
 * Writes shell governance JSON under `.artifacts/reports/shell-governance/`
 * (see docs/REPO_ARTIFACT_POLICY.md). Exit code 1 when invariants fail.
 */

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { collectShellRouteCatalogIssues } from "../services/assert-shell-route-catalog"
import { buildShellValidationReport } from "../services/shell-validation-report"
import { shellRouteMetadataList } from "../routes/shell-route-definitions"

const scriptDir = dirname(fileURLToPath(import.meta.url))
/** `shell/scripts` → monorepo root (`apps/web/src/app/_platform/shell/scripts` → 7× `..`). */
const repoRoot = join(scriptDir, "../../../../../../../")
const outDir = join(repoRoot, ".artifacts/reports/shell-governance")
const outFile = join(outDir, "shell-metadata-validation-report.json")

function main(): void {
  const issues = collectShellRouteCatalogIssues(shellRouteMetadataList)
  const report = buildShellValidationReport(
    shellRouteMetadataList.length,
    issues
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
}

main()
