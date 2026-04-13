import { describe, expect, it } from "vitest"

import { buildShellResolutionTrace } from "../services/build-shell-resolution-trace"
import {
  shellAppLayoutRoute,
  shellRouteMetadataList,
} from "../routes/shell-route-definitions"

const routeCatalog = shellRouteMetadataList

describe("buildShellResolutionTrace (strict AFENDA doctrine, locked)", () => {
  it("RES_TRACE_001: /app resolves to layout (direct)", () => {
    const [row] = buildShellResolutionTrace({
      pathnames: ["/app"],
      routeCatalog,
    })
    expect(row).toMatchObject({
      pathname: "/app",
      matchedRouteIds: ["app-layout"],
      resolvedRouteId: "app-layout",
      resolutionMode: "direct",
    })
  })

  it("RES_TRACE_002: /app/events resolves to events child (direct)", () => {
    const [row] = buildShellResolutionTrace({
      pathnames: ["/app/events"],
      routeCatalog,
    })
    expect(row).toMatchObject({
      pathname: "/app/events",
      matchedRouteIds: ["events", "app-layout"],
      resolvedRouteId: "events",
      resolutionMode: "direct",
    })
  })

  it("fallback only applies to descendants of canonical child routes", () => {
    const trace = buildShellResolutionTrace({
      pathnames: ["/app/events/123"],
      routeCatalog,
    })
    expect(trace).toEqual([
      {
        pathname: "/app/events/123",
        matchedRouteIds: ["events", "app-layout"],
        resolvedRouteId: "events",
        resolutionMode: "fallback",
      },
    ])
  })

  it("does NOT fallback for unknown app child paths (prefix evidence only)", () => {
    const trace = buildShellResolutionTrace({
      pathnames: ["/app/unknown"],
      routeCatalog,
    })
    expect(trace).toEqual([
      {
        pathname: "/app/unknown",
        matchedRouteIds: ["app-layout"],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ])
  })

  it("does NOT fallback for root-level paths", () => {
    const trace = buildShellResolutionTrace({
      pathnames: ["/login"],
      routeCatalog,
    })
    expect(trace).toEqual([
      {
        pathname: "/login",
        matchedRouteIds: [],
        resolvedRouteId: null,
        resolutionMode: "none",
      },
    ])
  })

  it("RES_TRACE_004: unknown /app child → none, not fallback to app-layout", () => {
    const [row] = buildShellResolutionTrace({
      pathnames: ["/app/unknown-child"],
      routeCatalog,
    })
    expect(row).toEqual({
      pathname: "/app/unknown-child",
      matchedRouteIds: ["app-layout"],
      resolvedRouteId: null,
      resolutionMode: "none",
    })
  })

  it("RES_TRACE_005: descendant under declared child → fallback to deepest static route", () => {
    const [row] = buildShellResolutionTrace({
      pathnames: ["/app/events/extra"],
      routeCatalog,
    })
    expect(row).toMatchObject({
      pathname: "/app/events/extra",
      matchedRouteIds: ["events", "app-layout"],
      resolvedRouteId: "events",
      resolutionMode: "fallback",
    })
  })

  it("RES_TRACE_006: layout-only catalog — /app/missing → none with layout prefix evidence", () => {
    const minimal = [shellAppLayoutRoute] as const
    const [row] = buildShellResolutionTrace({
      pathnames: ["/app/missing"],
      routeCatalog: minimal,
    })
    expect(row).toEqual({
      pathname: "/app/missing",
      matchedRouteIds: ["app-layout"],
      resolvedRouteId: null,
      resolutionMode: "none",
    })
  })

  it("RES_TRACE_007: output rows sorted by pathname", () => {
    const trace = buildShellResolutionTrace({
      pathnames: ["/login", "/app"],
      routeCatalog,
    })
    expect(trace.map((t) => t.pathname)).toEqual(["/app", "/login"])
  })
})
