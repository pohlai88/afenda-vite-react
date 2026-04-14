"use client"

import type { TFunction } from "i18next"
import type { ReactNode } from "react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"

import type { ShellNavigationItemId } from "../../constants/shell-navigation-item-ids"
import type { ShellNavigationItem } from "../../contract/shell-navigation-contract"
import { useShellNavigationForChrome } from "../../hooks/use-shell-navigation-for-chrome"
import { useShellRailWidgetPreferences } from "../../hooks/use-shell-rail-widget-preferences"
import {
  shellRailWidgetSlots,
  type ShellRailWidgetSlot,
} from "../shell-rail-sidebar-block/shell-rail-widgets.config"
import {
  AppShellSidebarRailNavLink,
  AppShellSidebarRailPlaceholder,
  AppShellSidebarRailWidgetPicker,
} from "../shell-rail-sidebar-block/shell-rail-mini-sidebar"
import {
  buildShellLeftSidebarNavigationModel,
  type ShellLeftSidebarNavigationModel,
} from "./shell-left-sidebar-topology"

export type { ShellLeftSidebarNavigationModel } from "./shell-left-sidebar-topology"

function renderRailWidgetSlots(
  slots: readonly ShellRailWidgetSlot[],
  fullPolicyById: ReadonlyMap<ShellNavigationItemId, ShellNavigationItem>,
  allowedIds: ReadonlySet<ShellNavigationItemId>,
  enabledIds: ReadonlySet<ShellNavigationItemId>,
  featureSlotsForPicker: readonly Extract<
    ShellRailWidgetSlot,
    { kind: "feature" }
  >[],
  pathname: string,
  t: TFunction<"shell">,
  onToggleFeature: (id: ShellNavigationItemId) => void
): ReactNode[] {
  const out: ReactNode[] = []

  for (const slot of slots) {
    if (slot.kind === "add") {
      out.push(
        <AppShellSidebarRailWidgetPicker
          key="rail-widget-picker"
          addButtonLabel={t("nav.widgets.add")}
          customizeLabel={t("nav.widgets.customize")}
          features={featureSlotsForPicker}
          allowedFeatureIds={allowedIds}
          enabledFeatureIds={enabledIds}
          onToggleFeature={onToggleFeature}
        />
      )
      continue
    }

    if (!enabledIds.has(slot.featureId) || !allowedIds.has(slot.featureId)) {
      continue
    }

    const item = fullPolicyById.get(slot.featureId)
    if (!item) {
      continue
    }

    const label = t(slot.labelKey)

    if (item.lifecycle === "comingSoon") {
      out.push(
        <AppShellSidebarRailPlaceholder
          key={slot.featureId}
          emoji={slot.emoji}
          label={label}
          tooltip={`${label} — ${t("nav.lifecycle.coming_soon")}`}
        />
      )
      continue
    }

    out.push(
      <AppShellSidebarRailNavLink
        key={slot.featureId}
        href={item.href}
        isActive={pathname === item.href}
        tooltip={label}
        icon={
          <span className="ui-shell-rail-emoji" aria-hidden>
            {slot.emoji}
          </span>
        }
        label={label}
      />
    )
  }

  return out
}

export type ShellLeftSidebarNavigationModelResult =
  ShellLeftSidebarNavigationModel & { readonly railWidgets: ReactNode[] }

export function useShellLeftSidebarNavigationModel(): ShellLeftSidebarNavigationModelResult {
  const { t } = useTranslation("shell")
  const { pathname, search } = useLocation()

  const items = useShellNavigationForChrome()
  const { enabledSet, toggleFeature } = useShellRailWidgetPreferences()

  const allowedById = useMemo(
    () => new Map(items.map((item) => [item.id, item] as const)),
    [items]
  )

  const allowedIds = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items]
  )

  const featureSlotsForPicker = useMemo(
    (): ReadonlyArray<Extract<ShellRailWidgetSlot, { kind: "feature" }>> =>
      shellRailWidgetSlots.filter(
        (slot): slot is Extract<ShellRailWidgetSlot, { kind: "feature" }> =>
          slot.kind === "feature"
      ),
    []
  )

  const railWidgets = useMemo(
    () =>
      renderRailWidgetSlots(
        shellRailWidgetSlots,
        allowedById,
        allowedIds,
        enabledSet,
        featureSlotsForPicker,
        pathname,
        t,
        toggleFeature
      ),
    [
      allowedIds,
      enabledSet,
      featureSlotsForPicker,
      allowedById,
      pathname,
      t,
      toggleFeature,
    ]
  )

  const explorerModel = useMemo(
    () =>
      buildShellLeftSidebarNavigationModel({
        t,
        pathname,
        search,
        allowedItems: items,
        enabledWidgetIds: enabledSet,
        toggleWidget: toggleFeature,
      }),
    [enabledSet, items, pathname, search, t, toggleFeature]
  )

  return useMemo(
    () => ({
      ...explorerModel,
      railWidgets,
    }),
    [explorerModel, railWidgets]
  )
}
