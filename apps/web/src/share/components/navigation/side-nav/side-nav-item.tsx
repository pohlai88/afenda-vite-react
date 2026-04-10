import { Link, useLocation } from "react-router-dom"

import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@afenda/shadcn-ui/components/ui/sidebar"

import { isTopNavItemActive, type TopNavItem } from "../nav-catalog/nav-model"
import { dashboardSidebarMenuButtonClassName } from "./dashboard-sidebar-tokens"
import { useCloseMobile } from "./use-close-mobile"

export interface SideNavItemProps {
  item: TopNavItem
}

/**
 * Single route in the side nav. Delegates all visual states (active, collapsed,
 * tooltip, icon sizing, text truncation) to shadcn `SidebarMenuButton` defaults.
 *
 * `notificationDot` renders a small attention indicator via `SidebarMenuBadge`
 * when the item has no numeric badge but still needs a presence signal.
 */
export function SideNavItem({ item }: SideNavItemProps) {
  const { pathname, search } = useLocation()
  const closeMobile = useCloseMobile()
  const isActive = isTopNavItemActive(pathname, item, search)
  const Icon = item.icon

  const showBadge =
    item.badge !== undefined && item.badge !== null && item.badge !== ""

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={dashboardSidebarMenuButtonClassName}
      >
        <Link
          to={item.to}
          onClick={closeMobile}
          aria-current={isActive ? "page" : undefined}
        >
          {Icon ? <Icon /> : null}
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>

      {showBadge ? (
        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
      ) : item.notificationDot ? (
        <SidebarMenuBadge>
          <span
            aria-hidden
            className="size-2 min-w-2 shrink-0 rounded-full bg-warning ring-2 ring-sidebar"
          />
          <span className="sr-only">New</span>
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  )
}
