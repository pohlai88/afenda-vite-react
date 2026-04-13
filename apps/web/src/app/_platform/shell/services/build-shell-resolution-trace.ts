import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"

import type { ShellResolutionTraceRecord } from "./shell-validation-report"

export interface BuildShellResolutionTraceOptions {
  readonly pathnames: readonly string[]
  readonly routeCatalog: readonly ShellRouteMetadata[]
}

/**
 * SHELL RESOLUTION DOCTRINE (catalog trace, strict AFENDA — locked)
 *
 * **direct** — Pathname exactly matches a governed canonical route path (layout `/app` or a
 * static child such as `/app/events`). Splat patterns (`/app/*`) are excluded from governance
 * matching here.
 *
 * **fallback** — No exact match; pathname is a **strict descendant** of a declared canonical
 * child route (`isDescendantOf(childPath, pathname)`). The resolved route is the **deepest**
 * such child. **`/app` is never a fallback target** (`route.path !== "/app"`), so unknown
 * `/app/…` segments never inherit app-layout as a false resolution.
 *
 * **none** — No governed **resolution** (`resolvedRouteId` is null): no exact match and no
 * eligible fallback. Prefix-only matches (e.g. layout under `/app/unknown`) may still appear in
 * `matchedRouteIds` as evidence without implying a resolved leaf — that preserves drift detection.
 *
 * Deterministic, catalog-only (no React router). Runtime metadata: `resolve-shell-metadata.ts`.
 */
function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim()
  if (trimmed.length === 0) {
    return "/"
  }
  if (trimmed === "/") {
    return trimmed
  }
  return trimmed.replace(/\/+$/, "") || "/"
}

function sortRoutesByPathDesc(
  routes: readonly ShellRouteMetadata[]
): ShellRouteMetadata[] {
  return [...routes].sort((a, b) => b.path.length - a.path.length)
}

function isExactMatch(routePath: string, pathname: string): boolean {
  return normalizePathname(routePath) === normalizePathname(pathname)
}

/** True when `pathname` is a strict path descendant of `parentPath` (not equal). */
function isDescendantOf(parentPath: string, pathname: string): boolean {
  const normalizedParent = normalizePathname(parentPath)
  const normalizedPath = normalizePathname(pathname)

  if (normalizedParent === "/") {
    return false
  }

  return normalizedPath.startsWith(`${normalizedParent}/`)
}

/**
 * Routes whose path is exactly `pathname` or a prefix ancestor in the URL tree.
 * Splat routes (`…/*`) are excluded — not canonical governance keys in this trace.
 */
function collectMatchedRoutes(
  pathname: string,
  routeCatalog: readonly ShellRouteMetadata[]
): ShellRouteMetadata[] {
  const np = normalizePathname(pathname)
  const governed = routeCatalog.filter((r) => !r.path.endsWith("/*"))

  const matched = governed.filter((r) => {
    const rp = normalizePathname(r.path)
    if (rp === np) {
      return true
    }
    if (rp === "/") {
      return np === "/"
    }
    return np === rp || np.startsWith(`${rp}/`)
  })

  return sortRoutesByPathDesc(matched)
}

export function buildShellResolutionTrace(
  options: BuildShellResolutionTraceOptions
): ShellResolutionTraceRecord[] {
  const { pathnames, routeCatalog } = options

  return [...pathnames]
    .map((pathname) => {
      const normalizedPathname = normalizePathname(pathname)

      const matchedRoutes = collectMatchedRoutes(
        normalizedPathname,
        routeCatalog
      )

      const exactRoute =
        matchedRoutes.find((route) =>
          isExactMatch(route.path, normalizedPathname)
        ) ?? null

      if (exactRoute !== null) {
        return {
          pathname: normalizedPathname,
          matchedRouteIds: matchedRoutes.map((r) => r.routeId),
          resolvedRouteId: exactRoute.routeId,
          resolutionMode: "direct" as const,
        }
      }

      const fallbackCandidates = matchedRoutes.filter(
        (route) =>
          route.path !== "/app" &&
          isDescendantOf(route.path, normalizedPathname)
      )

      const fallbackRoute =
        fallbackCandidates.length === 0
          ? null
          : fallbackCandidates.reduce((a, b) =>
              a.path.length >= b.path.length ? a : b
            )

      if (fallbackRoute !== null) {
        return {
          pathname: normalizedPathname,
          matchedRouteIds: matchedRoutes.map((r) => r.routeId),
          resolvedRouteId: fallbackRoute.routeId,
          resolutionMode: "fallback" as const,
        }
      }

      return {
        pathname: normalizedPathname,
        matchedRouteIds: matchedRoutes.map((r) => r.routeId),
        resolvedRouteId: null,
        resolutionMode: "none" as const,
      }
    })
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
}
