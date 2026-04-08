import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppShellStore } from '@/share/client-store/app-shell-store'
import type { NavConfigGroup, NavConfigItem } from './nav-config'
import {
  navGroups as defaultNavGroups,
  secondaryNavItems as defaultSecondaryNavItems,
} from './nav-config'
import type { TopNavGroup, TopNavItem } from './nav-model'

const APP_BASE = '/app/'
const EMPTY_PERMISSIONS: readonly string[] = []

export interface UseNavItemsResult {
  /** Flat list of all permitted nav items (for mobile drawer, command menu). */
  readonly items: readonly TopNavItem[]
  /** Grouped nav items preserving NavConfigGroup structure (for desktop dropdowns). */
  readonly groups: readonly TopNavGroup[]
  /** Secondary links (help, search) for side nav footer and similar. */
  readonly secondaryItems: readonly TopNavItem[]
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
  secondaryConfig: readonly NavConfigItem[] = defaultSecondaryNavItems,
): UseNavItemsResult {
  const { t } = useTranslation('shell')
  const permissions = useAppShellStore(
    (state) => state.currentUser?.permissions ?? EMPTY_PERMISSIONS,
  )

  return useMemo(() => {
    const groups: TopNavGroup[] = []
    const items: TopNavItem[] = []
    const secondaryItems: TopNavItem[] = []

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
          badge: item.badge,
          notificationDot: item.notificationDot,
        }

        groupItems.push(resolved)
        items.push(resolved)
      }

      if (groupItems.length > 0) {
        groups.push({
          id: group.id,
          label: t(group.labelKey as never),
          items: groupItems,
          showGroupLabel: group.showGroupLabel,
          collapsible: group.collapsible,
          defaultExpanded: group.defaultExpanded,
        })
      }
    }

    for (const item of secondaryConfig) {
      if (item.permissionKey && !permissions.includes(item.permissionKey)) {
        continue
      }
      secondaryItems.push({
        label: t(item.labelKey as never),
        to: `${APP_BASE}${item.path}`,
        icon: item.icon,
        exact: item.exact,
        badge: item.badge,
        notificationDot: item.notificationDot,
      })
    }

    return { items, groups, secondaryItems }
  }, [configGroups, permissions, secondaryConfig, t])
}
