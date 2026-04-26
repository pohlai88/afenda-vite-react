import type { ShellNavigationItemId } from "../../constants/shell-navigation-item-ids"
import type { ShellNavWidgetLabelKey } from "../../types/shell-i18n-keys"

/**
 * **Rail / panel widget selection** — which **features** from the canonical catalog
 * (`shellNavigationItems` in policy) appear in the shell nav.
 *
 * - **Brand** (workspace home tile) is **not** part of this list — it stays fixed in
 *   {@link AppShellSidebarBrandRail}.
 * - Every other nav row is a **configurable widget**: same `ShellNavigationItem` data,
 *   ordered and filtered by `enabledFeatureIds`.
 *
 * ## Empty array
 * If `enabledFeatureIds` is empty, the app treats that as “show all items that pass
 * permission filtering” (see `useShellNavigationForChrome`).
 */
export type ShellRailWidgetConfig = {
  /** Ordered feature ids to show; omitted ids stay out of rail + labels panel. */
  readonly enabledFeatureIds: readonly ShellNavigationItemId[]
}

/**
 * Left **icon rail** row: a **feature** (emoji + route or coming-soon tile) or **add**
 * (opens visibility checkboxes).
 */
export type ShellRailWidgetSlot =
  | {
      kind: "feature"
      featureId: ShellNavigationItemId
      /** Single grapheme / emoji shown in the narrow rail */
      emoji: string
      labelKey: ShellNavWidgetLabelKey
    }
  | { kind: "add" }

/**
 * Default: active workspace routes first, then **My-Project → My-Team → My-Report → My-Claim**
 * (coming soon in policy until routes ship).
 */
export const shellRailWidgetConfig: ShellRailWidgetConfig = {
  enabledFeatureIds: [
    "dashboard",
    "events",
    "counterparties",
    "audit",
    "my_project",
    "my_team",
    "my_report",
    "my_claim",
  ],
}

/**
 * Canonical rail rows: seven features + **+** (customize visibility).
 */
export const shellRailWidgetSlots: readonly ShellRailWidgetSlot[] = [
  {
    kind: "feature",
    featureId: "dashboard",
    emoji: "🏠",
    labelKey: "nav.widgets.my_erp",
  },
  {
    kind: "feature",
    featureId: "events",
    emoji: "🏢",
    labelKey: "nav.widgets.my_erp",
  },
  {
    kind: "feature",
    featureId: "counterparties",
    emoji: "🌐",
    labelKey: "nav.widgets.my_portal",
  },
  {
    kind: "feature",
    featureId: "audit",
    emoji: "📋",
    labelKey: "nav.widgets.my_task",
  },
  {
    kind: "feature",
    featureId: "my_project",
    emoji: "📊",
    labelKey: "nav.widgets.my_project",
  },
  {
    kind: "feature",
    featureId: "my_team",
    emoji: "👥",
    labelKey: "nav.widgets.my_team",
  },
  {
    kind: "feature",
    featureId: "my_report",
    emoji: "📈",
    labelKey: "nav.widgets.my_report",
  },
  {
    kind: "feature",
    featureId: "my_claim",
    emoji: "🧾",
    labelKey: "nav.widgets.my_claim",
  },
  { kind: "add" },
]

/**
 * **Icon ideas for “Project management & task tracking”** (avoid emoji / 3D asset packs in shell):
 * Prefer **Lucide** metaphors already common in ERP shells:
 * - **Board / backlog:** `Columns3Icon`, `LayoutGridIcon`, `LayoutDashboardIcon`
 * - **Work queue:** `ListIcon`, `InboxIcon`, `ClipboardListIcon` (add to icon bundle if missing)
 * - **Timeline / planning:** `GanttChartIcon`, `ChartGanttIcon` (generate if needed)
 * - **Milestones:** `FlagIcon`, `CircleCheckIcon`
 *
 * Add the chosen export to `shellIconNames` + `shell-navigation-policy` when the route exists.
 */
export const shellRailWidgetIconHintsPmTask = [
  "LayoutGridIcon",
  "LayoutDashboardIcon",
  "Columns3Icon",
  "ChartBarIcon",
  "ListIcon",
] as const
