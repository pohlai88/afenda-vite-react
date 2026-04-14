import type { ShellNavigationItem } from "../contract/shell-navigation-contract"
import type { ShellNavigationItemId } from "../constants/shell-navigation-item-ids"

/**
 * Keeps only ids listed in `enabledFeatureIds` (in that order). Unknown ids are skipped.
 */
export function orderNavigationItemsByRailConfig(
  items: readonly ShellNavigationItem[],
  enabledFeatureIds: readonly ShellNavigationItemId[]
): ShellNavigationItem[] {
  if (enabledFeatureIds.length === 0) {
    return [...items]
  }

  const byId = new Map<ShellNavigationItemId, ShellNavigationItem>(
    items.map((item) => [item.id, item])
  )
  const ordered: ShellNavigationItem[] = []

  for (const id of enabledFeatureIds) {
    const item = byId.get(id)
    if (item) {
      ordered.push(item)
    }
  }

  return ordered
}
