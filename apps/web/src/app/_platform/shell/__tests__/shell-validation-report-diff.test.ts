import { describe, expect, it } from "vitest"

import {
  SHELL_VALIDATION_REPORT_SCHEMA_VERSION,
  shellValidationReportDoctrine,
} from "../services/shell-validation-report"
import { diffShellValidationReports } from "../services/shell-validation-report-diff"
import type { ShellValidationReport } from "../services/shell-validation-report"

function makeReport(
  overrides: Partial<ShellValidationReport> = {}
): ShellValidationReport {
  return {
    status: "ok",
    generatedAt: "2026-04-14T00:00:00.000Z",
    routeCount: 2,
    issueCount: 0,
    issues: [],
    summary: {
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
      },
      byCode: {},
    },
    doctrine: shellValidationReportDoctrine,
    version: SHELL_VALIDATION_REPORT_SCHEMA_VERSION,
    ...overrides,
  }
}

describe("diffShellValidationReports", () => {
  it("returns no breaking changes for identical governance meaning", () => {
    const previous = makeReport({
      generatedAt: "2026-04-13T00:00:00.000Z",
    })
    const current = makeReport({
      generatedAt: "2026-04-14T00:00:00.000Z",
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.schemaCompatible).toBe(true)
    expect(diff.doctrineChanged).toBe(false)
    expect(diff.statusChanged).toBe(false)
    expect(diff.traceChanges).toEqual([])
    expect(diff.issues.newIssueCodes).toEqual([])
    expect(diff.hasBreakingChanges).toBe(false)
  })

  it("detects new issue codes as breaking", () => {
    const previous = makeReport()
    const current = makeReport({
      status: "error",
      issueCount: 1,
      issues: [
        {
          code: "SHELL_INV_COVERAGE_001",
          severity: "critical",
          message: "Required coverage sample did not resolve as expected.",
          path: "/app/events",
        },
      ],
      summary: {
        bySeverity: {
          critical: 1,
          high: 0,
          medium: 0,
        },
        byCode: {
          SHELL_INV_COVERAGE_001: 1,
        },
      },
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.issues.newIssueCodes).toEqual(["SHELL_INV_COVERAGE_001"])
    expect(diff.hasBreakingChanges).toBe(true)
  })

  it("detects trace changes as breaking", () => {
    const previous = makeReport({
      resolutionTrace: [
        {
          pathname: "/app/events/123",
          matchedRouteIds: ["events", "app-layout"],
          resolvedRouteId: "events",
          resolutionMode: "fallback",
        },
      ],
    })

    const current = makeReport({
      resolutionTrace: [
        {
          pathname: "/app/events/123",
          matchedRouteIds: ["app-layout"],
          resolvedRouteId: null,
          resolutionMode: "none",
        },
      ],
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.traceChanges).toEqual([
      {
        pathname: "/app/events/123",
        previousMode: "fallback",
        currentMode: "none",
        previousResolvedRouteId: "events",
        currentResolvedRouteId: null,
      },
    ])
    expect(diff.hasBreakingChanges).toBe(true)
  })

  it("detects removed required samples as breaking", () => {
    const previous = makeReport({
      traceSamples: {
        required: [
          {
            pathname: "/app/events/123",
            expectedMode: "fallback",
            expectedResolvedRouteId: "events",
          },
        ],
        negativeControls: [],
      },
    })

    const current = makeReport({
      traceSamples: {
        required: [],
        negativeControls: [],
      },
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.samples.removedRequired).toEqual([
      {
        pathname: "/app/events/123",
        expectedMode: "fallback",
        expectedResolvedRouteId: "events",
      },
    ])
    expect(diff.hasBreakingChanges).toBe(true)
  })

  it("detects schema incompatibility as breaking", () => {
    const previous = makeReport({
      version: "0.9" as unknown as ShellValidationReport["version"],
    })
    const current = makeReport()

    const diff = diffShellValidationReports(previous, current)

    expect(diff.schemaCompatible).toBe(false)
    expect(diff.hasBreakingChanges).toBe(true)
  })

  it("does not treat added required samples alone as breaking", () => {
    const previous = makeReport({
      traceSamples: {
        required: [
          {
            pathname: "/app",
            expectedMode: "direct",
            expectedResolvedRouteId: "app-layout",
          },
        ],
        negativeControls: [],
      },
    })

    const current = makeReport({
      traceSamples: {
        required: [
          {
            pathname: "/app",
            expectedMode: "direct",
            expectedResolvedRouteId: "app-layout",
          },
          {
            pathname: "/app/new",
            expectedMode: "direct",
            expectedResolvedRouteId: "new",
          },
        ],
        negativeControls: [],
      },
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.samples.addedRequired).toHaveLength(1)
    expect(diff.samples.addedRequired[0]?.pathname).toBe("/app/new")
    expect(diff.hasBreakingChanges).toBe(false)
  })

  it("detects added negative controls as breaking", () => {
    const previous = makeReport({
      traceSamples: {
        required: [],
        negativeControls: [],
      },
    })

    const current = makeReport({
      traceSamples: {
        required: [],
        negativeControls: [
          {
            pathname: "/extra-negative",
            expectedMode: "none",
            expectedResolvedRouteId: null,
          },
        ],
      },
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.samples.addedNegativeControls).toHaveLength(1)
    expect(diff.hasBreakingChanges).toBe(true)
  })

  it("detects issue key churn without new codes", () => {
    const previous = makeReport({
      status: "error",
      issueCount: 1,
      issues: [
        {
          code: "SHELL_INV_FIELD_001",
          severity: "high",
          message: "a",
        },
      ],
      summary: {
        bySeverity: { critical: 0, high: 1, medium: 0 },
        byCode: { SHELL_INV_FIELD_001: 1 },
      },
    })

    const current = makeReport({
      status: "error",
      issueCount: 1,
      issues: [
        {
          code: "SHELL_INV_FIELD_001",
          severity: "high",
          message: "b",
        },
      ],
      summary: {
        bySeverity: { critical: 0, high: 1, medium: 0 },
        byCode: { SHELL_INV_FIELD_001: 1 },
      },
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.issues.newIssueCodes).toEqual([])
    expect(diff.issues.newIssueKeys.length).toBeGreaterThan(0)
    expect(diff.hasBreakingChanges).toBe(false)
  })

  it("does not flag breaking when issues are fully resolved (ok transition)", () => {
    const previous = makeReport({
      status: "error",
      issueCount: 1,
      issues: [{ code: "SHELL_INV_FIELD_001", severity: "high", message: "x" }],
      summary: {
        bySeverity: { critical: 0, high: 1, medium: 0 },
        byCode: { SHELL_INV_FIELD_001: 1 },
      },
    })

    const current = makeReport({
      status: "ok",
      issueCount: 0,
      issues: [],
      summary: {
        bySeverity: { critical: 0, high: 0, medium: 0 },
        byCode: {},
      },
    })

    const diff = diffShellValidationReports(previous, current)

    expect(diff.issues.resolvedIssueCodes).toEqual(["SHELL_INV_FIELD_001"])
    expect(diff.statusChanged).toBe(true)
    expect(diff.hasBreakingChanges).toBe(false)
  })
})
