"use client"

import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { useCloseMobileSidebar } from "../../hooks/use-close-mobile-sidebar"

export const SHELL_LABELS_NAV_LINK_ROW_CLASSNAME = cn(
  "relative flex w-full min-w-0 items-center gap-2",
  "outline-none ring-sidebar-ring focus-visible:ring-2",
)

export type ShellLabelsNavLinkProps = {
  href: string
  isActive: boolean
  /** Tooltip for the menu button (e.g. narrow layouts). */
  tooltip?: string
  icon: ReactNode
  label: ReactNode
  /** For sr-only lifecycle hints; not part of the truncated label. */
  screenReaderExtras?: ReactNode
}

/** One top-level row in the labels column (icon + label + active rail). */
export function ShellLabelsNavLink({
  href,
  isActive,
  tooltip,
  icon,
  label,
  screenReaderExtras,
}: ShellLabelsNavLinkProps) {
  const closeMobileSidebar = useCloseMobileSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={tooltip}
        className="overflow-visible"
      >
        <NavLink
          to={href}
          onClick={closeMobileSidebar}
          className={SHELL_LABELS_NAV_LINK_ROW_CLASSNAME}
        >
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 left-0 h-[calc(100%-0.35rem)] w-1 -translate-y-1/2 rounded-r-full bg-sidebar-foreground transition-opacity",
              isActive ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          />

          <span className="relative flex min-w-0 flex-1 items-center gap-2 pl-1.5">
            {icon}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {screenReaderExtras}
          </span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
