import { describe, expect, it } from "vitest"

import type { ShellInvariantIssue } from "../contract/shell-invariant-contract"
import {
  buildShellValidationReport,
  SHELL_VALIDATION_REPORT_SCHEMA_VERSION,
  shellValidationReportDoctrine,
} from "../services/shell-validation-report"

describe("buildShellValidationReport", () => {
  it("sorts issues deterministically for stable report JSON", () => {
    const issues: ShellInvariantIssue[] = [
      {
        code: "SHELL_INV_FIELD_002",
        severity: "high",
        message: "second",
        routeId: "b",
      },
      {
        code: "SHELL_INV_FIELD_001",
        severity: "high",
        message: "first",
        routeId: "a",
      },
    ]

    const report = buildShellValidationReport(2, issues, {
      generatedAt: "2026-01-01T00:00:00.000Z",
    })

    expect(report.issues.map((i) => i.code)).toEqual([
      "SHELL_INV_FIELD_001",
      "SHELL_INV_FIELD_002",
    ])
  })

  it("includes status, timestamps, route counts, and empty summary when ok", () => {
    const report = buildShellValidationReport(5, [], {
      generatedAt: "2026-04-13T12:00:00.000Z",
    })

    expect(report.version).toBe(SHELL_VALIDATION_REPORT_SCHEMA_VERSION)
    expect(report.doctrine).toEqual(shellValidationReportDoctrine)
    expect(report.status).toBe("ok")
    expect(report.generatedAt).toBe("2026-04-13T12:00:00.000Z")
    expect(report.routeCount).toBe(5)
    expect(report.issueCount).toBe(0)
    expect(report.issues).toEqual([])
    expect(report.summary.bySeverity).toEqual({
      critical: 0,
      high: 0,
      medium: 0,
    })
    expect(report.summary.byCode).toEqual({})
    expect(report.resolutionTrace).toBeUndefined()
    expect(report.traceSamples).toBeUndefined()
  })

  it("aggregates summary.bySeverity and summary.byCode with sorted keys", () => {
    const issues: ShellInvariantIssue[] = [
      {
        code: "SHELL_INV_FIELD_001",
        severity: "high",
        message: "a",
        routeId: "r1",
      },
      {
        code: "SHELL_INV_FIELD_001",
        severity: "critical",
        message: "b",
        routeId: "r2",
      },
      {
        code: "SHELL_INV_ID_001",
        severity: "critical",
        message: "c",
        routeId: "r3",
      },
    ]

    const report = buildShellValidationReport(3, issues, {
      generatedAt: "2026-01-01T00:00:00.000Z",
    })

    expect(report.status).toBe("error")
    expect(report.issueCount).toBe(3)
    expect(report.summary.bySeverity).toEqual({
      critical: 2,
      high: 1,
      medium: 0,
    })
    expect(report.summary.byCode).toEqual({
      SHELL_INV_FIELD_001: 2,
      SHELL_INV_ID_001: 1,
    })
    expect(Object.keys(report.summary.bySeverity)).toEqual([
      "critical",
      "high",
      "medium",
    ])
    expect(Object.keys(report.summary.byCode)).toEqual([
      "SHELL_INV_FIELD_001",
      "SHELL_INV_ID_001",
    ])
  })

  it("embeds resolutionTrace when provided in options", () => {
    const trace = [
      {
        pathname: "/app/events",
        matchedRouteIds: ["app-layout", "events"],
        resolvedRouteId: "events",
        resolutionMode: "direct" as const,
      },
    ]

    const report = buildShellValidationReport(3, [], {
      generatedAt: "2026-01-01T00:00:00.000Z",
      resolutionTrace: trace,
    })

    expect(report.resolutionTrace).toEqual(trace)
  })

  it("embeds traceSamples when provided in options", () => {
    const traceSamples = {
      required: [
        {
          pathname: "/app",
          expectedMode: "direct" as const,
          expectedResolvedRouteId: "app-layout",
        },
      ],
      negativeControls: [
        {
          pathname: "/login",
          expectedMode: "none" as const,
          expectedResolvedRouteId: null,
        },
      ],
    }

    const report = buildShellValidationReport(1, [], {
      generatedAt: "2026-01-01T00:00:00.000Z",
      traceSamples,
    })

    expect(report.traceSamples).toEqual(traceSamples)
  })
})
