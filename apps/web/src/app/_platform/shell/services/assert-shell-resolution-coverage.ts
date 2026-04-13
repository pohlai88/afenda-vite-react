import type { ShellInvariantIssue } from "../contract/shell-invariant-contract"
import type { ShellResolutionTraceRecord } from "./shell-validation-report"
import type {
  ShellTraceExpectation,
  ShellValidationTraceSamples,
} from "./shell-validation-trace-samples"
import { createShellInvariantError } from "./shell-invariant-error-map"

function indexTraceByPathname(
  trace: readonly ShellResolutionTraceRecord[]
): Map<string, ShellResolutionTraceRecord> {
  return new Map(trace.map((record) => [record.pathname, record]))
}

function collectExpectationMismatchIssue(
  expectation: ShellTraceExpectation,
  actual: ShellResolutionTraceRecord | undefined
): ShellInvariantIssue | null {
  if (!actual) {
    return {
      code: "SHELL_INV_COVERAGE_001",
      severity: "critical",
      path: expectation.pathname,
      message:
        expectation.expectedMode === "none"
          ? "Governance trace is missing a row for this sample pathname."
          : "Required trace sample is missing from resolution trace.",
      details: {
        expectedMode: expectation.expectedMode,
        expectedResolvedRouteId: expectation.expectedResolvedRouteId,
      },
    }
  }

  if (
    actual.resolutionMode !== expectation.expectedMode ||
    actual.resolvedRouteId !== expectation.expectedResolvedRouteId
  ) {
    return {
      code:
        expectation.expectedMode === "none"
          ? "SHELL_INV_COVERAGE_002"
          : "SHELL_INV_COVERAGE_001",
      severity: expectation.expectedMode === "none" ? "high" : "critical",
      path: expectation.pathname,
      message:
        expectation.expectedMode === "none"
          ? "Negative control path must not resolve to shell metadata."
          : "Required coverage sample did not resolve as expected.",
      details: {
        expectedMode: expectation.expectedMode,
        actualMode: actual.resolutionMode,
        expectedResolvedRouteId: expectation.expectedResolvedRouteId,
        actualResolvedRouteId: actual.resolvedRouteId,
        matchedRouteIds: actual.matchedRouteIds,
      },
    }
  }

  return null
}

export function collectShellResolutionCoverageIssues(
  trace: readonly ShellResolutionTraceRecord[],
  samples: ShellValidationTraceSamples
): ShellInvariantIssue[] {
  const issues: ShellInvariantIssue[] = []
  const traceByPathname = indexTraceByPathname(trace)

  for (const expectation of samples.required) {
    const issue = collectExpectationMismatchIssue(
      expectation,
      traceByPathname.get(expectation.pathname)
    )
    if (issue) {
      issues.push(issue)
    }
  }

  for (const expectation of samples.negativeControls) {
    const issue = collectExpectationMismatchIssue(
      expectation,
      traceByPathname.get(expectation.pathname)
    )
    if (issue) {
      issues.push(issue)
    }
  }

  return issues
}

export function assertShellResolutionCoverage(
  trace: readonly ShellResolutionTraceRecord[],
  samples: ShellValidationTraceSamples
): void {
  const issues = collectShellResolutionCoverageIssues(trace, samples)

  if (issues.length > 0) {
    throw createShellInvariantError(issues)
  }
}
