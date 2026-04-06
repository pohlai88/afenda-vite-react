import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppShellStore } from '@/share/state/use-app-shell-store'
import type { NavConfigGroup } from './nav-config'
import { navGroups as defaultNavGroups } from './nav-config'
import type { TopNavGroup, TopNavItem } from './nav-model'

const APP_BASE = '/app/'

export interface UseNavItemsResult {
  /** Flat list of all permitted nav items (for mobile drawer, command menu). */
  readonly items: readonly TopNavItem[]
  /** Grouped nav items preserving NavConfigGroup structure (for desktop dropdowns). */
  readonly groups: readonly TopNavGroup[]
}

/**
 * Resolves navigation config into renderable nav items by:
 * 1. Filtering items the current user has permission to see
 * 2. Resolving i18n label keys into translated strings
 * 3. Prefixing paths with the app base route
 * 4. Preserving group structure for desktop nav rendering
 */
export function useNavItems(
  configGroups: readonly NavConfigGroup[] = defaultNavGroups,
): UseNavItemsResult {
  const { t } = useTranslation('shell')
  const permissions = useAppShellStore(
    (state) => state.currentUser?.permissions ?? [],
  )

  return useMemo(() => {
    const groups: TopNavGroup[] = []
    const items: TopNavItem[] = []

    for (const group of configGroups) {
      const groupItems: TopNavItem[] = []

      for (const item of group.items) {
        if (item.permissionKey && !permissions.includes(item.permissionKey)) {
          continue
        }

        const resolved: TopNavItem = {
          label: t(item.labelKey as never),
          to: `${APP_BASE}${item.path}`,
          icon: item.icon,
          exact: item.exact,
        }

        groupItems.push(resolved)
        items.push(resolved)
      }

      if (groupItems.length > 0) {
        groups.push({
          label: t(group.labelKey as never),
          items: groupItems,
        })
      }
    }

    return { items, groups }
  }, [configGroups, permissions, t])
}
