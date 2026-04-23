/**
 * Compare two `ShellValidationReport` JSON files (baseline vs current).
 * Prints the diff as JSON to stdout. Exit code 1 if `hasBreakingChanges`, else 0.
 *
 * Usage:
 *   pnpm --filter @afenda/web exec tsx --tsconfig config/tsconfig/app.json \
 *     src/app/_platform/shell/scripts/inspect-shell-validation-report-diff.ts <baseline.json> <current.json>
 */

import { readFileSync } from "node:fs"

import type { ShellValidationReport } from "../services/shell-validation-report"
import { diffShellValidationReports } from "../services/shell-validation-report-diff"
import { formatShellValidationReportDiff } from "../services/format-shell-validation-report-diff"

function main(): void {
  const args = process.argv.slice(2).filter((a) => a !== "--")
  const baselinePath = args[0]
  const currentPath = args[1]

  if (!baselinePath || !currentPath) {
    console.error(
      "Usage: inspect-shell-validation-report-diff <baseline.json> <current.json>"
    )
    process.exitCode = 2
    return
  }

  const previous = JSON.parse(
    readFileSync(baselinePath, "utf8")
  ) as ShellValidationReport
  const current = JSON.parse(
    readFileSync(currentPath, "utf8")
  ) as ShellValidationReport

  const diff = diffShellValidationReports(previous, current)

  if (diff.hasBreakingChanges) {
    console.error(formatShellValidationReportDiff(diff))
    console.error("")
    console.error(JSON.stringify(diff, null, 2))
    process.exitCode = 1
  } else {
    console.log(`${JSON.stringify(diff, null, 2)}\n`)
  }
}

main()
