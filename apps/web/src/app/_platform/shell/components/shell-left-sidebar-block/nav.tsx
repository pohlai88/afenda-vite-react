"use client"

import type { TFunction } from "i18next"
import { useTranslation } from "react-i18next"
import { NavLink, useLocation } from "react-router-dom"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type { ShellNavigationItemId } from "../../constants/shell-navigation-item-ids"
import type { ShellNavigationItem } from "../../contract/shell-navigation-contract"
import { useCloseMobileSidebar } from "../../hooks/use-close-mobile-sidebar"
import { isShellNavRouteActive } from "../../utils/shell-nav-route-active"
import { translateShellSidebarSubNavLabel } from "../../utils/translate-shell-namespace-key"
import {
  shellSidebarCategories,
  shellSidebarFeatureSubNav,
  type ShellSidebarSubNavEntry,
} from "../shell-rail-sidebar-block/shell-left-sidebar-nav-config"
import { ShellIcon } from "../shell-icon"
import {
  ShellLabelsNavLink,
  SHELL_LABELS_NAV_LINK_ROW_CLASSNAME,
} from "./nav-link"

type ShellLabelsColumnNavProps = {
  grouped: ReadonlyMap<string, ShellNavigationItem[]>
  enabledSet: ReadonlySet<ShellNavigationItemId>
}

/** Resolved sub-link row (same contract as config; preserved for typing through resolve). */
type ShellResolvedSubNavigationItem = ShellSidebarSubNavEntry

type ShellResolvedNavigationItem = {
  item: ShellNavigationItem
  label: string
  isActive: boolean
  isComingSoon: boolean
  isDeprecated: boolean
  isBeta: boolean
  subItems: readonly ShellResolvedSubNavigationItem[]
  hasSubNav: boolean
  hasActiveSubItem: boolean
}

const SORTED_SHELL_SIDEBAR_CATEGORIES = [...shellSidebarCategories].sort(
  (a, b) => a.order - b.order,
)

const EMPTY_GROUP_CLASS =
  "border-sidebar-border bg-sidebar-accent/20 min-h-[120px] border border-dashed"

function resolveNavigationItem(
  item: ShellNavigationItem,
  pathname: string,
  t: TFunction<"shell">,
): ShellResolvedNavigationItem {
  const subItems = shellSidebarFeatureSubNav[item.id] ?? []
  const isComingSoon = item.lifecycle === "comingSoon"
  const isDeprecated = item.lifecycle === "deprecated"
  const isBeta = item.lifecycle === "beta"
  const isActive = isShellNavRouteActive(pathname, item.href)
  const hasActiveSubItem = subItems.some((sub) =>
    isShellNavRouteActive(pathname, sub.href),
  )

  return {
    item,
    label: t(item.labelKey),
    isActive,
    isComingSoon,
    isDeprecated,
    isBeta,
    subItems,
    hasSubNav: subItems.length > 0 && !isComingSoon,
    hasActiveSubItem,
  }
}

function renderLifecycleScreenReaderExtras(
  resolved: ShellResolvedNavigationItem,
  t: TFunction<"shell">,
) {
  if (!resolved.isDeprecated && !resolved.isBeta) {
    return undefined
  }

  return (
    <>
      {resolved.isDeprecated ? (
        <span className="sr-only">{t("nav.lifecycle.deprecated")}</span>
      ) : null}
      {resolved.isBeta ? (
        <span className="sr-only">{t("nav.lifecycle.beta")}</span>
      ) : null}
    </>
  )
}

function FlatNavigationRow({
  resolved,
  t,
}: {
  resolved: ShellResolvedNavigationItem
  t: TFunction<"shell">
}) {
  if (resolved.isComingSoon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-disabled
          className="ui-shell-nav-disabled"
          disabled
          type="button"
        >
          <ShellIcon name={resolved.item.iconName} />
          <span>{resolved.label}</span>
          <span className="sr-only">{t("nav.lifecycle.coming_soon")}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <ShellLabelsNavLink
      href={resolved.item.href}
      isActive={resolved.isActive}
      tooltip={resolved.label}
      icon={<ShellIcon name={resolved.item.iconName} />}
      label={resolved.label}
      screenReaderExtras={renderLifecycleScreenReaderExtras(resolved, t)}
    />
  )
}

/** Feature row with sub-links: parent links to `item.href`; sub-items always listed (no expand/collapse). */
function StaticSubNavFeatureRow({
  resolved,
  pathname,
  t,
}: {
  resolved: ShellResolvedNavigationItem
  pathname: string
  t: TFunction<"shell">
}) {
  const closeMobileSidebar = useCloseMobileSidebar()
  const rowActive = resolved.isActive || resolved.hasActiveSubItem

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={rowActive}
        tooltip={resolved.label}
        className="overflow-visible"
      >
        <NavLink
          to={resolved.item.href}
          onClick={closeMobileSidebar}
          className={SHELL_LABELS_NAV_LINK_ROW_CLASSNAME}
        >
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 left-0 h-[calc(100%-0.35rem)] w-1 -translate-y-1/2 rounded-r-full bg-sidebar-foreground transition-opacity",
              resolved.isActive ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          />

          <span className="relative flex min-w-0 flex-1 items-center gap-2 pl-1.5">
            <ShellIcon name={resolved.item.iconName} />
            <span className="min-w-0 flex-1 truncate">{resolved.label}</span>
            {renderLifecycleScreenReaderExtras(resolved, t)}
          </span>
        </NavLink>
      </SidebarMenuButton>

      <SidebarMenuSub>
        {resolved.subItems.map((sub) => (
          <SidebarMenuSubItem key={sub.labelKey}>
            <SidebarMenuSubButton
              asChild
              isActive={isShellNavRouteActive(pathname, sub.href)}
            >
              <NavLink
                to={sub.href}
                onClick={closeMobileSidebar}
                className="flex w-full min-w-0"
              >
                <span className="truncate">
                  {translateShellSidebarSubNavLabel(t, sub.labelKey)}
                </span>
              </NavLink>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ))}
      </SidebarMenuSub>
    </SidebarMenuItem>
  )
}

/** Policy-driven nav tree for the labels column (groups, empty states). */
export function ShellLabelsColumnNav({
  grouped,
  enabledSet,
}: ShellLabelsColumnNavProps) {
  const { t } = useTranslation("shell")
  const { pathname } = useLocation()

  return (
    <>
      {SORTED_SHELL_SIDEBAR_CATEGORIES.map((category) => {
        const groupItems = grouped.get(category.groupId) ?? []
        const visibleItems = groupItems.filter((item) => enabledSet.has(item.id))

        if (visibleItems.length === 0) {
          return (
            <SidebarGroup key={`${category.id}-empty`}>
              <SidebarGroupLabel>{t(category.labelKey)}</SidebarGroupLabel>
              <SidebarGroupContent className="px-2 pb-2">
                <Empty className={EMPTY_GROUP_CLASS}>
                  <EmptyHeader>
                    <EmptyTitle>{t("nav.widgets.empty_title")}</EmptyTitle>
                    <EmptyDescription>
                      {t("nav.widgets.empty_description")}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        }

        return (
          <SidebarGroup key={category.id}>
            <SidebarGroupLabel>{t(category.labelKey)}</SidebarGroupLabel>

            <SidebarMenu>
              {visibleItems.map((item) => {
                const resolved = resolveNavigationItem(item, pathname, t)

                if (resolved.hasSubNav) {
                  return (
                    <StaticSubNavFeatureRow
                      key={resolved.item.id}
                      resolved={resolved}
                      pathname={pathname}
                      t={t}
                    />
                  )
                }

                return (
                  <FlatNavigationRow
                    key={resolved.item.id}
                    resolved={resolved}
                    t={t}
                  />
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )
      })}
    </>
  )
}
