import { describe, expect, it } from "vitest"

import {
  assertShellResolutionCoverage,
  collectShellResolutionCoverageIssues,
} from "../services/assert-shell-resolution-coverage"
import type { ShellResolutionTraceRecord } from "../services/shell-validation-report"

describe("assertShellResolutionCoverage", () => {
  it("accepts required paths that resolve", () => {
    const trace = [
      {
        pathname: "/app",
        matchedRouteIds: ["app-layout"],
        resolvedRouteId: "app-layout",
        resolutionMode: "direct",
      },
      {
        pathname: "/app/events",
        matchedRouteIds: ["events", "app-layout"],
        resolvedRouteId: "events",
        resolutionMode: "direct",
      },
      {
        pathname: "/login",
        matchedRouteIds: [],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ] as const satisfies readonly ShellResolutionTraceRecord[]

    const samples = {
      required: [
        {
          pathname: "/app",
          expectedMode: "direct" as const,
          expectedResolvedRouteId: "app-layout",
        },
        {
          pathname: "/app/events",
          expectedMode: "direct" as const,
          expectedResolvedRouteId: "events",
        },
      ],
      negativeControls: [
        {
          pathname: "/login",
          expectedMode: "none" as const,
          expectedResolvedRouteId: null,
        },
      ],
    } as const

    expect(() => assertShellResolutionCoverage(trace, samples)).not.toThrow()
  })

  it("fails when a required path resolves to none", () => {
    const trace = [
      {
        pathname: "/app/events",
        matchedRouteIds: ["app-layout"],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ] as const satisfies readonly ShellResolutionTraceRecord[]

    const samples = {
      required: [
        {
          pathname: "/app/events",
          expectedMode: "direct" as const,
          expectedResolvedRouteId: "events",
        },
      ],
      negativeControls: [],
    } as const

    const issues = collectShellResolutionCoverageIssues(trace, samples)

    expect(
      issues.some((issue) => issue.code === "SHELL_INV_COVERAGE_001")
    ).toBe(true)
  })

  it("fails when a negative control path resolves", () => {
    const trace = [
      {
        pathname: "/app/unknown",
        matchedRouteIds: ["app-layout"],
        resolvedRouteId: "app-layout",
        resolutionMode: "fallback",
      },
    ] as const satisfies readonly ShellResolutionTraceRecord[]

    const samples = {
      required: [],
      negativeControls: [
        {
          pathname: "/app/unknown",
          expectedMode: "none" as const,
          expectedResolvedRouteId: null,
        },
      ],
    } as const

    const issues = collectShellResolutionCoverageIssues(trace, samples)

    expect(
      issues.some((issue) => issue.code === "SHELL_INV_COVERAGE_002")
    ).toBe(true)
  })

  it("accepts governed app paths that resolve directly or by fallback (required list)", () => {
    const trace: readonly ShellResolutionTraceRecord[] = [
      {
        pathname: "/app",
        matchedRouteIds: ["app-layout"],
        resolvedRouteId: "app-layout",
        resolutionMode: "direct",
      },
      {
        pathname: "/app/events/123",
        matchedRouteIds: ["events", "app-layout"],
        resolvedRouteId: "events",
        resolutionMode: "fallback",
      },
    ]

    const samples = {
      required: [
        {
          pathname: "/app",
          expectedMode: "direct" as const,
          expectedResolvedRouteId: "app-layout",
        },
        {
          pathname: "/app/events/123",
          expectedMode: "fallback" as const,
          expectedResolvedRouteId: "events",
        },
      ],
      negativeControls: [],
    }

    expect(() => assertShellResolutionCoverage(trace, samples)).not.toThrow()
  })

  it("ignores non-shell paths when not listed as required", () => {
    const trace: readonly ShellResolutionTraceRecord[] = [
      {
        pathname: "/login",
        matchedRouteIds: [],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ]

    const samples = {
      required: [],
      negativeControls: [],
    }

    expect(() => assertShellResolutionCoverage(trace, samples)).not.toThrow()
  })

  it("treats strict negative /app/unknown as passing when mode is none", () => {
    const trace: readonly ShellResolutionTraceRecord[] = [
      {
        pathname: "/app/unknown",
        matchedRouteIds: ["app-layout"],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ]

    const samples = {
      required: [],
      negativeControls: [
        {
          pathname: "/app/unknown",
          expectedMode: "none" as const,
          expectedResolvedRouteId: null,
        },
      ],
    }

    expect(() => assertShellResolutionCoverage(trace, samples)).not.toThrow()
  })

  it("accepts required direct and fallback expectations", () => {
    const trace = [
      {
        pathname: "/app/events",
        matchedRouteIds: ["events", "app-layout"],
        resolvedRouteId: "events",
        resolutionMode: "direct",
      },
      {
        pathname: "/app/events/123",
        matchedRouteIds: ["events", "app-layout"],
        resolvedRouteId: "events",
        resolutionMode: "fallback",
      },
      {
        pathname: "/app/unknown",
        matchedRouteIds: ["app-layout"],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ] as const satisfies readonly ShellResolutionTraceRecord[]

    const samples = {
      required: [
        {
          pathname: "/app/events",
          expectedMode: "direct" as const,
          expectedResolvedRouteId: "events",
        },
        {
          pathname: "/app/events/123",
          expectedMode: "fallback" as const,
          expectedResolvedRouteId: "events",
        },
      ],
      negativeControls: [
        {
          pathname: "/app/unknown",
          expectedMode: "none" as const,
          expectedResolvedRouteId: null,
        },
      ],
    } as const

    expect(() => assertShellResolutionCoverage(trace, samples)).not.toThrow()
  })

  it("fails when descendant fallback resolves incorrectly", () => {
    const trace = [
      {
        pathname: "/app/events/123",
        matchedRouteIds: ["events", "app-layout"],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ] as const satisfies readonly ShellResolutionTraceRecord[]

    const samples = {
      required: [
        {
          pathname: "/app/events/123",
          expectedMode: "fallback" as const,
          expectedResolvedRouteId: "events",
        },
      ],
      negativeControls: [],
    } as const

    const issues = collectShellResolutionCoverageIssues(trace, samples)

    expect(
      issues.some((issue) => issue.code === "SHELL_INV_COVERAGE_001")
    ).toBe(true)
  })
})
