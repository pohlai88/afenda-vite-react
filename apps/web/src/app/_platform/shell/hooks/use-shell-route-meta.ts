import { useMemo } from "react"
import { useLocation, useMatches } from "react-router-dom"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import type { ShellMetadataTrace } from "../types/shell-metadata-trace"
import { resolveShellRouteResolution } from "../services/resolve-shell-route-resolution"

/**
 * Deepest route match that defines non-null `handle.shell` (declared shell metadata).
 * `handle.shell === null` means explicitly no shell chrome for that match — returns `undefined`.
 */
export function useShellRouteMeta(): ShellMetadata | undefined {
  return useShellRouteResolution().shell
}

/**
 * Shell metadata plus resolution trace (match index, pathname, optional registered route id).
 */
export function useShellRouteResolution(): {
  shell: ShellMetadata | undefined
  trace: ShellMetadataTrace
} {
  const matches = useMatches()
  const { pathname } = useLocation()

  return useMemo(
    () => resolveShellRouteResolution(matches, pathname),
    [matches, pathname]
  )
}
