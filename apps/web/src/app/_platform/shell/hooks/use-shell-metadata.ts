/**
 * SHELL METADATA HOOK
 *
 * Runtime integration hook for current shell metadata.
 * Sources metadata from the deepest route `handle.shell` (see `useShellRouteMeta`).
 *
 * **Validation policy:** `resolveShellMetadata` runs `validateShellMetadata` in development
 * and logs issues. Production does not throw — incorrect metadata is caught by CI via
 * `assertShellRouteCatalog` and Vitest. Use `collectShellRouteCatalogIssues` / assertion helpers
 * in scripts and tests for fail-fast governance.
 */

import { useMemo } from "react"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { resolveShellMetadata } from "../services/resolve-shell-metadata"
import { useShellRouteMeta } from "./use-shell-route-meta"

export function useShellMetadata(): ShellMetadata {
  const shell = useShellRouteMeta()

  return useMemo(
    () =>
      resolveShellMetadata({
        metadata: shell,
        validate: import.meta.env.DEV,
        onValidationIssues: (issues) => {
          for (const issue of issues) {
            console.error(
              `[shell-metadata] ${issue.code} at ${issue.path}: ${issue.message}`
            )
          }
        },
      }),
    [shell]
  )
}
