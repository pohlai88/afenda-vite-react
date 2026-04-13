import { describe, expect, it } from "vitest"

import { resolveShellRouteResolution } from "../services/resolve-shell-route-resolution"

describe("resolveShellRouteResolution (RESOLVE invariants)", () => {
  it("RESOLVE_001: deepest match with non-null shell wins", () => {
    const shellLeaf = {
      titleKey: "breadcrumb.events",
      breadcrumbs: [],
    }
    const matches = [
      {
        id: "root",
        pathname: "/app",
        params: {},
        handle: { shell: { titleKey: "breadcrumb.app", breadcrumbs: [] } },
      },
      {
        id: "child",
        pathname: "/app/events",
        params: {},
        handle: { shell: shellLeaf },
      },
    ] as const

    const { shell, trace } = resolveShellRouteResolution(
      matches as unknown as Parameters<typeof resolveShellRouteResolution>[0],
      "/app/events"
    )
    expect(shell).toBe(shellLeaf)
    expect(trace.resolvedMatchIndex).toBe(1)
  })

  it("RESOLVE_003: same matches + pathname yields same shell reference", () => {
    const matches = [
      {
        pathname: "/app",
        handle: { shell: { titleKey: "breadcrumb.app", breadcrumbs: [] } },
      },
    ] as const
    const m = matches as unknown as Parameters<
      typeof resolveShellRouteResolution
    >[0]
    const a = resolveShellRouteResolution(m, "/app")
    const b = resolveShellRouteResolution(m, "/app")
    expect(a.shell).toBe(b.shell)
    expect(a.trace.matchedPath).toBe(b.trace.matchedPath)
  })
})
