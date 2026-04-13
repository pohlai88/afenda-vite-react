import type { ShellTraceExpectation } from "./shell-validation-trace-samples"

export interface ShellValidationReportTraceChange {
  readonly pathname: string
  readonly previousMode: "direct" | "fallback" | "none" | null
  readonly currentMode: "direct" | "fallback" | "none" | null
  readonly previousResolvedRouteId: string | null
  readonly currentResolvedRouteId: string | null
}

export interface ShellValidationReportSampleDelta {
  readonly addedRequired: readonly ShellTraceExpectation[]
  readonly removedRequired: readonly ShellTraceExpectation[]
  readonly addedNegativeControls: readonly ShellTraceExpectation[]
  readonly removedNegativeControls: readonly ShellTraceExpectation[]
}

export interface ShellValidationReportIssueDelta {
  readonly newIssueCodes: readonly string[]
  readonly resolvedIssueCodes: readonly string[]
  readonly newIssueKeys: readonly string[]
  readonly resolvedIssueKeys: readonly string[]
}

export interface ShellValidationReportDiff {
  readonly previousVersion: string
  readonly currentVersion: string
  readonly schemaCompatible: boolean
  readonly doctrineChanged: boolean

  readonly previousStatus: "ok" | "error"
  readonly currentStatus: "ok" | "error"
  readonly statusChanged: boolean

  readonly issues: ShellValidationReportIssueDelta
  readonly traceChanges: readonly ShellValidationReportTraceChange[]
  readonly samples: ShellValidationReportSampleDelta

  readonly hasBreakingChanges: boolean
}
