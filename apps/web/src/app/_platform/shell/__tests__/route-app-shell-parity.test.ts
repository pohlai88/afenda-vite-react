import { describe, expect, it } from "vitest"

import {
  shellAppChildPathSegments,
  shellAppChildRouteDefinitions,
} from ".."
import { appShellRouteObject } from "../../../../routes/route-app-shell"

function isPlainChildRoute(value: unknown): value is {
  path?: string
  index?: boolean
  handle?: Record<string, unknown>
} {
  return typeof value === "object" && value !== null
}

describe("app shell router parity", () => {
  it("canonical child definitions match router child path segments", () => {
    const children = appShellRouteObject.children ?? []

    const routerPathSegments = children
      .filter(isPlainChildRoute)
      .filter((child) => child.index !== true)
      .map((child) => child.path)
      .filter(
        (path): path is string =>
          typeof path === "string" && path.length > 0 && path !== "*"
      )

    expect(new Set(routerPathSegments).size).toBe(routerPathSegments.length)
    expect(new Set(shellAppChildPathSegments).size).toBe(
      shellAppChildPathSegments.length
    )

    expect(routerPathSegments).toEqual([...shellAppChildPathSegments])
  })

  it("every canonical child definition carries governed shell metadata", () => {
    for (const definition of shellAppChildRouteDefinitions) {
      expect(definition.pathSegment.trim().length).toBeGreaterThan(0)
      expect(definition.metadata.routeId.trim().length).toBeGreaterThan(0)
      expect(definition.metadata.path.trim().length).toBeGreaterThan(0)
      expect(definition.metadata.shell.titleKey.trim().length).toBeGreaterThan(
        0
      )
    }
  })

  it("app-shell splat route remains governed", () => {
    const children = appShellRouteObject.children ?? []

    const splatRoute = children.find(
      (child) =>
        typeof child === "object" &&
        child !== null &&
        "path" in child &&
        child.path === "*"
    )

    expect(splatRoute).toBeDefined()
    expect(
      typeof splatRoute === "object" &&
        splatRoute !== null &&
        "handle" in splatRoute &&
        splatRoute.handle &&
        typeof splatRoute.handle === "object" &&
        "shell" in splatRoute.handle
    ).toBe(true)
  })
})
