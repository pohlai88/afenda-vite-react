import { describe, expect, it } from "vitest"

import { formatShellValidationReportDiff } from "../services/format-shell-validation-report-diff"
import type { ShellValidationReportDiff } from "../services/shell-validation-report-diff-contract"

function makeDiff(
  overrides: Partial<ShellValidationReportDiff> = {}
): ShellValidationReportDiff {
  return {
    previousVersion: "1.0",
    currentVersion: "1.0",
    schemaCompatible: true,
    doctrineChanged: false,
    previousStatus: "ok",
    currentStatus: "ok",
    statusChanged: false,
    issues: {
      newIssueCodes: [],
      resolvedIssueCodes: [],
      newIssueKeys: [],
      resolvedIssueKeys: [],
    },
    traceChanges: [],
    samples: {
      addedRequired: [],
      removedRequired: [],
      addedNegativeControls: [],
      removedNegativeControls: [],
    },
    hasBreakingChanges: false,
    ...overrides,
  }
}

describe("formatShellValidationReportDiff", () => {
  it("formats a minimal diff summary", () => {
    const output = formatShellValidationReportDiff(makeDiff())

    expect(output).toContain("Shell governance diff summary")
    expect(output).toContain("- Schema compatible: yes")
    expect(output).toContain("- Doctrine changed: no")
    expect(output).toContain("- Status: ok → ok")
    expect(output).toContain("- Breaking changes: no")
  })

  it("uses failed title when breaking", () => {
    const output = formatShellValidationReportDiff(
      makeDiff({ hasBreakingChanges: true })
    )
    expect(output).toContain("Shell governance diff failed")
  })

  it("formats issue, trace, and sample sections when present", () => {
    const output = formatShellValidationReportDiff(
      makeDiff({
        currentStatus: "error",
        statusChanged: true,
        hasBreakingChanges: true,
        issues: {
          newIssueCodes: ["SHELL_INV_COVERAGE_001"],
          resolvedIssueCodes: [],
          newIssueKeys: [],
          resolvedIssueKeys: [],
        },
        traceChanges: [
          {
            pathname: "/app/events/123",
            previousMode: "fallback",
            currentMode: "none",
            previousResolvedRouteId: "events",
            currentResolvedRouteId: null,
          },
        ],
        samples: {
          addedRequired: [],
          removedRequired: [
            {
              pathname: "/app/events/123",
              expectedMode: "fallback",
              expectedResolvedRouteId: "events",
            },
          ],
          addedNegativeControls: [],
          removedNegativeControls: [],
        },
      })
    )

    expect(output).toContain("New issue codes")
    expect(output).toContain("- SHELL_INV_COVERAGE_001")
    expect(output).toContain("Trace changes")
    expect(output).toContain("- /app/events/123: fallback(events) → none(null)")
    expect(output).toContain("Removed required samples")
    expect(output).toContain("- /app/events/123 expected fallback → events")
  })
})
