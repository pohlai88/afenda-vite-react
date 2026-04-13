import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@afenda/design-system/ui-primitives"
import type { ShellNavigationItem } from "../contract/shell-navigation-contract"
import { shellNavigationGroups } from "../policy/shell-navigation-policy"
import { shellSlotActivationV1 } from "../policy/shell-navigation-policy"
import { useShellNavigation } from "../hooks/use-shell-navigation"
import { ShellNavIcon } from "./shell-nav-icon"

function groupItemsByGroup(
  items: readonly ShellNavigationItem[]
): Map<string, ShellNavigationItem[]> {
  const map = new Map<string, ShellNavigationItem[]>()
  for (const item of items) {
    const list = map.get(item.groupId) ?? []
    list.push(item)
    map.set(item.groupId, list)
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.order - b.order)
  }
  return map
}

export function AppShellSidebar() {
  const { t } = useTranslation("shell")
  const { pathname } = useLocation()
  const items = useShellNavigation()
  const grouped = useMemo(() => groupItemsByGroup(items), [items])

  const sortedGroups = useMemo(
    () => [...shellNavigationGroups].sort((a, b) => a.order - b.order),
    []
  )

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="truncate font-semibold text-sidebar-foreground">
            {t("sidebar.brand")}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sortedGroups.map((group) => {
          const groupItems = grouped.get(group.id) ?? []
          if (groupItems.length === 0) {
            return null
          }

          return (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupItems.map((item) => {
                    const isComingSoon = item.lifecycle === "comingSoon"
                    const isDeprecated = item.lifecycle === "deprecated"
                    const showBeta = item.lifecycle === "beta"

                    if (isComingSoon) {
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            aria-disabled
                            className="cursor-not-allowed opacity-60"
                            disabled
                            type="button"
                          >
                            <ShellNavIcon name={item.iconName} />
                            <span>{t(item.labelKey)}</span>
                            <span className="sr-only">
                              {t("nav.lifecycle.coming_soon")}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    }

                    const isActive = pathname === item.href

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={t(item.labelKey)}
                        >
                          <NavLink to={item.href}>
                            <ShellNavIcon name={item.iconName} />
                            <span>{t(item.labelKey)}</span>
                            {isDeprecated ? (
                              <span className="sr-only">
                                {t("nav.lifecycle.deprecated")}
                              </span>
                            ) : null}
                            {showBeta ? (
                              <span className="sr-only">
                                {t("nav.lifecycle.beta")}
                              </span>
                            ) : null}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      {shellSlotActivationV1["shell.sidebar.footer"] ? (
        <>
          <SidebarSeparator />
          <div data-slot="shell.sidebar.footer" className="p-2" />
        </>
      ) : null}
      <SidebarRail />
    </Sidebar>
  )
}
