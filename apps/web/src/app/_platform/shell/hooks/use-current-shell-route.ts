import { useMemo } from "react"
import { useLocation } from "react-router-dom"

import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"
import { shellRouteMetadataList } from "../routes/shell-route-definitions"

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "")
  return trimmed === "" ? "/" : trimmed
}

/**
 * Returns the registered {@link ShellRouteMetadata} for the current location when
 * the pathname matches a canonical shell route (`shell-route-definitions`).
 *
 * Unknown `/app/*` paths (for example splat 404) do not match — returns `undefined`.
 * Deepest `handle.shell` for chrome is still available via {@link useShellRouteMeta}.
 */
export function useCurrentShellRoute(): ShellRouteMetadata | undefined {
  const { pathname } = useLocation()

  return useMemo(() => {
    const key = normalizePathname(pathname)
    return shellRouteMetadataList.find((route) => route.path === key)
  }, [pathname])
}
