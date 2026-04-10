import type { ComponentPropsWithoutRef } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@afenda/shadcn-ui/components/ui/sidebar"

import { isTopNavItemActive, type TopNavItem } from "../nav-catalog/nav-model"
import { useCloseMobile } from "./use-close-mobile"

export interface SideNavSecondaryProps extends ComponentPropsWithoutRef<
  typeof SidebarGroup
> {
  items: readonly TopNavItem[]
}

export function SideNavSecondary({ items, ...props }: SideNavSecondaryProps) {
  const { t } = useTranslation("shell")
  const { pathname, search } = useLocation()
  const closeMobile = useCloseMobile()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>{t("nav.group_secondary" as never)}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = isTopNavItemActive(pathname, item, search)
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link
                    to={item.to}
                    onClick={closeMobile}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.icon ? <item.icon /> : null}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
