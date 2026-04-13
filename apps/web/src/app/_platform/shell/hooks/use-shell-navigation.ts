import { useMemo } from "react"

import type { ShellNavigationItem } from "../contract/shell-navigation-contract"
import { shellNavigationItems } from "../policy/shell-navigation-policy"
import { defaultShellPermissionsStub } from "../policy/shell-policy"
import { filterShellNavigationItems } from "../services/filter-shell-navigation-items"

export interface UseShellNavigationOptions {
  readonly permissions?: readonly string[]
}

/**
 * Advisory filtered navigation for the shell chrome. Pass `permissions` from auth when available.
 */
export function useShellNavigation(
  options: UseShellNavigationOptions = {}
): readonly ShellNavigationItem[] {
  const permissions = options.permissions ?? defaultShellPermissionsStub

  return useMemo(
    () =>
      filterShellNavigationItems(shellNavigationItems, {
        permissions,
      }),
    [permissions]
  )
}
