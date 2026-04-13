import type {
  ShellInvariantIssue,
  ShellInvariantSeverity,
} from "../contract/shell-invariant-contract"

import type { ShellValidationTraceSamples } from "./shell-validation-trace-samples"

/** Schema version for CI artifacts and consumers that branch on report shape. */
export const SHELL_VALIDATION_REPORT_SCHEMA_VERSION = "1.0" as const

export type ShellValidationReportSchemaVersion =
  typeof SHELL_VALIDATION_REPORT_SCHEMA_VERSION

/**
 * Self-contained semantics for `resolutionTrace` / coverage (embedded in every report so
 * reviewers do not need repo context to interpret modes).
 */
export interface ShellValidationReportDoctrine {
  readonly resolutionModes: {
    readonly direct: string
    readonly fallback: string
    readonly none: string
  }
  readonly coverageRules: {
    readonly required: string
    readonly negativeControls: string
  }
  readonly scope: {
    /** URL prefix for governed authenticated app shell routes in this artifact. */
    readonly governedPrefix: string
  }
}

/** Frozen doctrine strings — single source for builder output and documentation. */
export const shellValidationReportDoctrine: ShellValidationReportDoctrine = {
  resolutionModes: {
    direct: "exact canonical route match",
    fallback: "descendant of declared canonical child route",
    none: "no governed match",
  },
  coverageRules: {
    required: "must resolve as expected",
    negativeControls: "must not resolve",
  },
  scope: {
    governedPrefix: "/app",
  },
}

/**
 * Optional path-resolution evidence (populated when trace is wired; not required for catalog validation).
 */
export interface ShellResolutionTraceRecord {
  readonly pathname: string
  readonly matchedRouteIds: readonly string[]
  readonly resolvedRouteId: string | null
  readonly resolutionMode: "direct" | "fallback" | "none"
}

export interface ShellValidationReportSummary {
  /** Counts by severity; all three keys always present (zeros omitted from meaning, not from shape). */
  readonly bySeverity: Readonly<Record<ShellInvariantSeverity, number>>
  /** Counts by `ShellInvariantIssue.code` (keys sorted alphabetically in JSON). */
  readonly byCode: Readonly<Record<string, number>>
}

/**
 * Standalone governance artifact: invariants, optional trace, expectations, and embedded doctrine.
 */
export interface ShellValidationReport {
  readonly status: "ok" | "error"
  /** ISO 8601 timestamp when the report was built (governance artifact provenance). */
  readonly generatedAt: string
  readonly routeCount: number
  readonly issueCount: number
  readonly issues: readonly ShellInvariantIssue[]
  readonly summary: ShellValidationReportSummary
  /** Optional resolution trace when the builder supplies it (runtime path matching evidence). */
  readonly resolutionTrace?: readonly ShellResolutionTraceRecord[]
  /** Governance sample expectations (required + negative controls) when supplied. */
  readonly traceSamples?: ShellValidationTraceSamples
  /** How to read `resolutionMode` and coverage rules without external docs. */
  readonly doctrine: ShellValidationReportDoctrine
  /** Report JSON schema version (bump when fields or semantics change). */
  readonly version: ShellValidationReportSchemaVersion
}

export interface BuildShellValidationReportOptions {
  /** Override clock (tests); defaults to `new Date().toISOString()`. */
  readonly generatedAt?: string
  /** Optional trace rows to embed in the report (reserved for future resolver instrumentation). */
  readonly resolutionTrace?: readonly ShellResolutionTraceRecord[]
  readonly traceSamples?: ShellValidationTraceSamples
}

/** Deterministic ordering for CI artifacts and snapshot-stable JSON. */
function compareShellInvariantIssues(
  a: ShellInvariantIssue,
  b: ShellInvariantIssue
): number {
  const byCode = a.code.localeCompare(b.code)
  if (byCode !== 0) return byCode
  const byRoute = (a.routeId ?? "").localeCompare(b.routeId ?? "")
  if (byRoute !== 0) return byRoute
  const byPath = (a.path ?? "").localeCompare(b.path ?? "")
  if (byPath !== 0) return byPath
  const byCrumb = (a.breadcrumbId ?? "").localeCompare(b.breadcrumbId ?? "")
  if (byCrumb !== 0) return byCrumb
  return a.message.localeCompare(b.message)
}

function sortNumericRecord(
  counts: Record<string, number>
): Readonly<Record<string, number>> {
  const sortedKeys = Object.keys(counts).sort((x, y) => x.localeCompare(y))
  const out: Record<string, number> = {}
  for (const k of sortedKeys) {
    out[k] = counts[k]!
  }
  return out
}

function emptySeverityCounts(): Record<ShellInvariantSeverity, number> {
  return { critical: 0, high: 0, medium: 0 }
}

function summarizeIssues(
  issues: readonly ShellInvariantIssue[]
): ShellValidationReportSummary {
  const bySeverity = emptySeverityCounts()
  const byCode: Record<string, number> = {}

  for (const issue of issues) {
    bySeverity[issue.severity] += 1
    byCode[issue.code] = (byCode[issue.code] ?? 0) + 1
  }

  return {
    // alphabetical key order for stable JSON: critical, high, medium
    bySeverity: sortNumericRecord(bySeverity) as Readonly<
      Record<ShellInvariantSeverity, number>
    >,
    byCode: sortNumericRecord(byCode),
  }
}

export function buildShellValidationReport(
  routeCount: number,
  issues: readonly ShellInvariantIssue[],
  options?: BuildShellValidationReportOptions
): ShellValidationReport {
  const sorted = [...issues].sort(compareShellInvariantIssues)
  const generatedAt = options?.generatedAt ?? new Date().toISOString()

  return {
    status: sorted.length === 0 ? "ok" : "error",
    generatedAt,
    routeCount,
    issueCount: sorted.length,
    issues: sorted,
    summary: summarizeIssues(sorted),
    ...(options?.resolutionTrace !== undefined
      ? { resolutionTrace: options.resolutionTrace }
      : {}),
    ...(options?.traceSamples !== undefined
      ? { traceSamples: options.traceSamples }
      : {}),
    doctrine: shellValidationReportDoctrine,
    version: SHELL_VALIDATION_REPORT_SCHEMA_VERSION,
  }
}
