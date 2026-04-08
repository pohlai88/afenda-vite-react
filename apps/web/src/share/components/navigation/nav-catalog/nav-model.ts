import type { ComponentType, SVGProps } from 'react'

export interface TopNavItem {
  label: string
  to: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  exact?: boolean
  badge?: string | number
  notificationDot?: boolean
}

export interface TopNavGroup {
  /** Stable id from `NavConfigGroup.id`. */
  id: string
  label: string
  items: readonly TopNavItem[]
  /** When false, sidebar renders separator + items only (no section title). */
  showGroupLabel?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
}

function buildFullPath(pathname: string, search: string): string {
  if (!search || search === '') return pathname
  const query = search.startsWith('?') ? search.slice(1) : search
  return `${pathname}?${query}`
}

/**
 * Route-aware active check. When `search` is provided, matches include the query string
 * (e.g. `?tab=overview`). Hrefs that include `?` require a full path + query match.
 */
export function isTopNavItemActive(
  pathname: string,
  item: TopNavItem,
  search = '',
): boolean {
  const fullPath = buildFullPath(pathname, search)
  const href = item.to

  if (item.exact) {
    return fullPath === href
  }

  if (href.includes('?')) {
    return fullPath === href
  }

  const basePath = href.split('?')[0] ?? href
  return pathname === basePath || pathname.startsWith(`${basePath}/`)
}
