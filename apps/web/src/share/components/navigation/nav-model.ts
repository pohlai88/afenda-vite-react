import type { ComponentType, SVGProps } from 'react'

export interface TopNavItem {
  label: string
  to: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  exact?: boolean
}

export interface TopNavGroup {
  label: string
  items: readonly TopNavItem[]
}

export function isTopNavItemActive(pathname: string, item: TopNavItem) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to)
}
