import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"

import type {
  ShellTraceExpectation,
  ShellValidationTraceSamples,
} from "./shell-validation-trace-samples"

/**
 * Builds governance trace expectations: direct samples for every concrete catalog path
 * (splat patterns such as `/app/*` are keys, not navigable pathnames — skipped), optional
 * declared **fallback** descendants per route `coverage`, and fixed negative controls.
 */
export function buildShellValidationTraceSamples(
  routeCatalog: readonly ShellRouteMetadata[]
): ShellValidationTraceSamples {
  const requiredByPath = new Map<string, ShellTraceExpectation>()

  for (const route of routeCatalog) {
    if (route.path.endsWith("/*")) {
      continue
    }
    requiredByPath.set(route.path, {
      pathname: route.path,
      expectedMode: "direct",
      expectedResolvedRouteId: route.routeId,
    })
  }

  for (const route of routeCatalog) {
    for (const pathname of route.coverage?.descendantSamplePaths ?? []) {
      requiredByPath.set(pathname, {
        pathname,
        expectedMode: "fallback",
        expectedResolvedRouteId: route.routeId,
      })
    }
  }

  const required = [...requiredByPath.values()].sort((a, b) =>
    a.pathname.localeCompare(b.pathname)
  )

  const negativeControls: ShellTraceExpectation[] = [
    {
      pathname: "/",
      expectedMode: "none",
      expectedResolvedRouteId: null,
    },
    {
      pathname: "/login",
      expectedMode: "none",
      expectedResolvedRouteId: null,
    },
    {
      pathname: "/app/unknown",
      expectedMode: "none",
      expectedResolvedRouteId: null,
    },
  ]

  return {
    required,
    negativeControls,
  }
}
