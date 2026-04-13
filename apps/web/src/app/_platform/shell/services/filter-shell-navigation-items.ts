import type { ShellNavigationItem } from "../contract/shell-navigation-contract"

export interface FilterShellNavigationItemsContext {
  readonly permissions: ReadonlySet<string> | readonly string[]
}

function toSet(
  permissions: ReadonlySet<string> | readonly string[]
): ReadonlySet<string> {
  return permissions instanceof Set ? permissions : new Set(permissions)
}

/**
 * Advisory UI filter: drops `disabled` lifecycle, optional permission keys, `isEnabled: false`.
 * `comingSoon` items remain listed but should not navigate (handled in sidebar).
 */
export function filterShellNavigationItems(
  items: readonly ShellNavigationItem[],
  context: FilterShellNavigationItemsContext
): ShellNavigationItem[] {
  const granted = toSet(context.permissions)

  return items.filter((item) => {
    if (item.lifecycle === "disabled") {
      return false
    }
    if (item.isEnabled === false) {
      return false
    }
    const keys = item.permissionKeys
    if (!keys?.length) {
      return true
    }
    return keys.every((key) => granted.has(key))
  })
}
