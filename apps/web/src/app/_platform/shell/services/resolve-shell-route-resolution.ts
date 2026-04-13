import type { UIMatch } from "react-router-dom"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import type { ShellMetadataTrace } from "../types/shell-metadata-trace"
import { shellRouteMetadataList } from "../routes/shell-route-definitions"

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "")
  return trimmed === "" ? "/" : trimmed
}

function registeredRouteIdForPathname(pathname: string): string | undefined {
  const key = normalizePathname(pathname)
  return shellRouteMetadataList.find((r) => r.path === key)?.routeId
}

type Handle = { shell?: ShellMetadata | null }

export function resolveShellRouteResolution(
  matches: readonly UIMatch[],
  pathname: string
): {
  shell: ShellMetadata | undefined
  trace: ShellMetadataTrace
} {
  const registeredRouteId = registeredRouteIdForPathname(pathname)

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const match = matches[i]
    if (match === undefined) {
      continue
    }

    const raw = match.handle as Handle | undefined
    if (raw === undefined) {
      continue
    }

    if (raw.shell === null) {
      return {
        shell: undefined,
        trace: {
          matchedPath: match.pathname,
          resolvedMatchIndex: i,
          resolutionDepth: matches.length - 1 - i,
          registeredRouteId,
          explicitNoShell: true,
        },
      }
    }

    if (raw.shell !== undefined) {
      return {
        shell: raw.shell,
        trace: {
          matchedPath: match.pathname,
          resolvedMatchIndex: i,
          resolutionDepth: matches.length - 1 - i,
          registeredRouteId,
        },
      }
    }
  }

  return {
    shell: undefined,
    trace: {
      matchedPath: pathname,
      resolvedMatchIndex: null,
      resolutionDepth: matches.length,
      registeredRouteId,
    },
  }
}
