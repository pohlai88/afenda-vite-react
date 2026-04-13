import type {
  ShellValidationReportDiff,
  ShellValidationReportTraceChange,
} from "./shell-validation-report-diff-contract"
import type { ShellTraceExpectation } from "./shell-validation-trace-samples"

function formatResolved(mode: string | null, routeId: string | null): string {
  return `${mode ?? "null"}(${routeId ?? "null"})`
}

function formatTraceChange(change: ShellValidationReportTraceChange): string {
  return `- ${change.pathname}: ${formatResolved(
    change.previousMode,
    change.previousResolvedRouteId
  )} → ${formatResolved(change.currentMode, change.currentResolvedRouteId)}`
}

function formatSample(sample: ShellTraceExpectation): string {
  return `- ${sample.pathname} expected ${sample.expectedMode} → ${
    sample.expectedResolvedRouteId ?? "null"
  }`
}

function pushSection(
  lines: string[],
  title: string,
  values: readonly string[]
): void {
  if (values.length === 0) {
    return
  }

  lines.push("")
  lines.push(title)
  lines.push(...values)
}

/**
 * Human-readable, deterministic summary for CI logs (pair with `diffShellValidationReports`).
 */
export function formatShellValidationReportDiff(
  diff: ShellValidationReportDiff
): string {
  const lines: string[] = []

  const title = diff.hasBreakingChanges
    ? "Shell governance diff failed"
    : "Shell governance diff summary"

  lines.push(title)
  lines.push("")
  lines.push(`- Schema compatible: ${diff.schemaCompatible ? "yes" : "no"}`)
  lines.push(`- Doctrine changed: ${diff.doctrineChanged ? "yes" : "no"}`)
  lines.push(`- Status: ${diff.previousStatus} → ${diff.currentStatus}`)
  lines.push(`- Breaking changes: ${diff.hasBreakingChanges ? "yes" : "no"}`)

  pushSection(
    lines,
    "New issue codes",
    diff.issues.newIssueCodes.map((code) => `- ${code}`)
  )

  pushSection(
    lines,
    "Resolved issue codes",
    diff.issues.resolvedIssueCodes.map((code) => `- ${code}`)
  )

  pushSection(lines, "Trace changes", diff.traceChanges.map(formatTraceChange))

  pushSection(
    lines,
    "Added required samples",
    diff.samples.addedRequired.map(formatSample)
  )

  pushSection(
    lines,
    "Removed required samples",
    diff.samples.removedRequired.map(formatSample)
  )

  pushSection(
    lines,
    "Added negative controls",
    diff.samples.addedNegativeControls.map(formatSample)
  )

  pushSection(
    lines,
    "Removed negative controls",
    diff.samples.removedNegativeControls.map(formatSample)
  )

  return lines.join("\n")
}
