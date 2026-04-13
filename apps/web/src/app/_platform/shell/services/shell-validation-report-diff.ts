import type { ShellInvariantIssue } from "../contract/shell-invariant-contract"

import type {
  ShellValidationReportDiff,
  ShellValidationReportIssueDelta,
  ShellValidationReportSampleDelta,
  ShellValidationReportTraceChange,
} from "./shell-validation-report-diff-contract"
import type {
  ShellResolutionTraceRecord,
  ShellValidationReport,
} from "./shell-validation-report"
import type { ShellTraceExpectation } from "./shell-validation-trace-samples"

function stableIssueKey(issue: ShellInvariantIssue): string {
  return [
    issue.code,
    issue.severity,
    issue.routeId ?? "",
    issue.path ?? "",
    issue.breadcrumbId ?? "",
    issue.message,
  ].join("::")
}

function sortStrings(values: Iterable<string>): string[] {
  return [...values].sort((left, right) => left.localeCompare(right))
}

function indexTrace(
  trace: readonly ShellResolutionTraceRecord[] | undefined
): Map<string, ShellResolutionTraceRecord> {
  return new Map((trace ?? []).map((record) => [record.pathname, record]))
}

function stableSampleKey(sample: ShellTraceExpectation): string {
  return [
    sample.pathname,
    sample.expectedMode,
    sample.expectedResolvedRouteId ?? "",
  ].join("::")
}

function diffSamples(
  previous: readonly ShellTraceExpectation[],
  current: readonly ShellTraceExpectation[]
): {
  readonly added: readonly ShellTraceExpectation[]
  readonly removed: readonly ShellTraceExpectation[]
} {
  const previousMap = new Map(
    previous.map((sample) => [stableSampleKey(sample), sample])
  )
  const currentMap = new Map(
    current.map((sample) => [stableSampleKey(sample), sample])
  )

  const added = [...currentMap.entries()]
    .filter(([key]) => !previousMap.has(key))
    .map(([, sample]) => sample)
    .sort((a, b) => stableSampleKey(a).localeCompare(stableSampleKey(b)))

  const removed = [...previousMap.entries()]
    .filter(([key]) => !currentMap.has(key))
    .map(([, sample]) => sample)
    .sort((a, b) => stableSampleKey(a).localeCompare(stableSampleKey(b)))

  return { added, removed }
}

function diffTrace(
  previousTrace: readonly ShellResolutionTraceRecord[] | undefined,
  currentTrace: readonly ShellResolutionTraceRecord[] | undefined
): ShellValidationReportTraceChange[] {
  const previousIndex = indexTrace(previousTrace)
  const currentIndex = indexTrace(currentTrace)

  const allPathnames = new Set<string>([
    ...previousIndex.keys(),
    ...currentIndex.keys(),
  ])

  return [...allPathnames]
    .map((pathname) => {
      const previous = previousIndex.get(pathname)
      const current = currentIndex.get(pathname)

      const previousMode = previous?.resolutionMode ?? null
      const currentMode = current?.resolutionMode ?? null
      const previousResolvedRouteId = previous?.resolvedRouteId ?? null
      const currentResolvedRouteId = current?.resolvedRouteId ?? null

      const changed =
        previousMode !== currentMode ||
        previousResolvedRouteId !== currentResolvedRouteId

      if (!changed) {
        return null
      }

      return {
        pathname,
        previousMode,
        currentMode,
        previousResolvedRouteId,
        currentResolvedRouteId,
      } satisfies ShellValidationReportTraceChange
    })
    .filter(
      (value): value is ShellValidationReportTraceChange => value !== null
    )
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
}

function diffIssues(
  previous: ShellValidationReport,
  current: ShellValidationReport
): ShellValidationReportIssueDelta {
  const previousCodes = new Set(previous.issues.map((issue) => issue.code))
  const currentCodes = new Set(current.issues.map((issue) => issue.code))

  const previousKeys = new Set(previous.issues.map(stableIssueKey))
  const currentKeys = new Set(current.issues.map(stableIssueKey))

  return {
    newIssueCodes: sortStrings(
      [...currentCodes].filter((code) => !previousCodes.has(code))
    ),
    resolvedIssueCodes: sortStrings(
      [...previousCodes].filter((code) => !currentCodes.has(code))
    ),
    newIssueKeys: sortStrings(
      [...currentKeys].filter((key) => !previousKeys.has(key))
    ),
    resolvedIssueKeys: sortStrings(
      [...previousKeys].filter((key) => !currentKeys.has(key))
    ),
  }
}

/**
 * Deterministic diff between two `ShellValidationReport` artifacts (CI / governance).
 */
export function diffShellValidationReports(
  previous: ShellValidationReport,
  current: ShellValidationReport
): ShellValidationReportDiff {
  const schemaCompatible = previous.version === current.version
  const doctrineChanged =
    JSON.stringify(previous.doctrine) !== JSON.stringify(current.doctrine)

  const issues = diffIssues(previous, current)
  const traceChanges = diffTrace(
    previous.resolutionTrace,
    current.resolutionTrace
  )

  const previousRequired = previous.traceSamples?.required ?? []
  const currentRequired = current.traceSamples?.required ?? []
  const previousNegativeControls = previous.traceSamples?.negativeControls ?? []
  const currentNegativeControls = current.traceSamples?.negativeControls ?? []

  const requiredDelta = diffSamples(previousRequired, currentRequired)
  const negativeControlDelta = diffSamples(
    previousNegativeControls,
    currentNegativeControls
  )

  const samples: ShellValidationReportSampleDelta = {
    addedRequired: requiredDelta.added,
    removedRequired: requiredDelta.removed,
    addedNegativeControls: negativeControlDelta.added,
    removedNegativeControls: negativeControlDelta.removed,
  }

  const previousStatus = previous.status
  const currentStatus = current.status
  const statusChanged = previousStatus !== currentStatus

  const hasBreakingChanges =
    !schemaCompatible ||
    doctrineChanged ||
    (previousStatus === "ok" && currentStatus === "error") ||
    issues.newIssueCodes.length > 0 ||
    traceChanges.length > 0 ||
    samples.removedRequired.length > 0 ||
    samples.addedNegativeControls.length > 0

  return {
    previousVersion: previous.version,
    currentVersion: current.version,
    schemaCompatible,
    doctrineChanged,
    previousStatus,
    currentStatus,
    statusChanged,
    issues,
    traceChanges,
    samples,
    hasBreakingChanges,
  }
}
