import { describe, expect, it } from "vitest"

import { erpModuleCatalog, validateErpModuleCatalog } from "../index"
import {
  shellAppChildPathSegments,
  shellRouteMetadataList,
} from "../../shell/routes/shell-route-definitions"

function uniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length
}

describe("erp module catalog", () => {
  it("keeps ids, route ids, and path segments unique", () => {
    expect(validateErpModuleCatalog(erpModuleCatalog)).toEqual([])
    expect(
      uniqueValues(erpModuleCatalog.map((module) => module.moduleId))
    ).toBe(true)
    expect(uniqueValues(erpModuleCatalog.map((module) => module.routeId))).toBe(
      true
    )
    expect(
      uniqueValues(erpModuleCatalog.map((module) => module.pathSegment))
    ).toBe(true)
  })

  it("keeps enabled catalog entries covered by shell route metadata", () => {
    const shellRouteIds = new Set(
      shellRouteMetadataList.map((route) => route.routeId)
    )
    const enabledRouteIds = erpModuleCatalog
      .filter((module) => module.lifecycle === "enabled")
      .map((module) => module.routeId)

    expect(enabledRouteIds.length).toBeGreaterThan(0)

    for (const routeId of enabledRouteIds) {
      expect(shellRouteIds.has(routeId), routeId).toBe(true)
    }
  })

  it("does not create live shell routes for planned catalog entries", () => {
    const shellRouteIds = new Set(
      shellRouteMetadataList.map((route) => route.routeId)
    )
    const shellPathSegments = new Set(shellAppChildPathSegments)
    const plannedModules = erpModuleCatalog.filter(
      (module) => module.lifecycle === "planned"
    )

    expect(plannedModules.length).toBeGreaterThan(0)

    for (const module of plannedModules) {
      expect(shellRouteIds.has(module.routeId), module.routeId).toBe(false)
      expect(
        shellPathSegments.has(module.pathSegment),
        module.pathSegment
      ).toBe(false)
    }
  })

  it("keeps permission keys as catalog metadata, not shell route metadata", () => {
    expect(
      erpModuleCatalog.every((module) =>
        module.permissionKeys.every((key) => key.trim().length > 0)
      )
    ).toBe(true)

    for (const route of shellRouteMetadataList) {
      expect("permissionKeys" in route).toBe(false)
      expect("permissionKeys" in route.shell).toBe(false)
    }
  })

  it("keeps legacy references read-only and inside .legacy/cna-templates", () => {
    const legacyReferences = erpModuleCatalog.flatMap(
      (module) => module.legacyReferencePaths ?? []
    )

    expect(legacyReferences.length).toBeGreaterThan(0)
    expect(
      legacyReferences.every((legacyPath) =>
        legacyPath.startsWith(".legacy/cna-templates/")
      )
    ).toBe(true)
  })
})
