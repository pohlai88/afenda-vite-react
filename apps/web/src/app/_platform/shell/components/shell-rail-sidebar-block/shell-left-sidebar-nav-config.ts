import type { ShellNavigationGroupId } from "../../constants/shell-navigation-group-ids"
import type { ShellNavigationItemId } from "../../constants/shell-navigation-item-ids"
import type {
  ShellNavGroupLabelKey,
  ShellNavSidebarSubLabelKey,
} from "../../types/shell-i18n-keys"

/**
 * **Labels column nav layout** (wide pane beside the icon rail — not the rail).
 * Categories are fixed here; feature rows and routes are injected from
 * {@link shellNavigationItems} / chrome hooks at runtime.
 *
 * - **Categories** map to `groupId` in `shell-navigation-policy` (which items appear).
 * - **Sub-navigation** is optional metadata per feature (child links under the feature row).
 */
export type ShellSidebarCategoryConfig = {
  readonly id: string
  readonly groupId: ShellNavigationGroupId
  readonly labelKey: ShellNavGroupLabelKey
  readonly order: number
}

/** Hardcoded category list (order + labels). */
export const shellSidebarCategories: readonly ShellSidebarCategoryConfig[] = [
  {
    id: "workspace",
    groupId: "workspace",
    labelKey: "nav.groups.workspace",
    order: 0,
  },
]

/** One sub link under a feature (see `shellSidebarFeatureSubNav`). */
export type ShellSidebarSubNavEntry = {
  readonly labelKey: ShellNavSidebarSubLabelKey
  readonly href: string
}

/**
 * Optional sub-links per feature. Paths should stay aligned with
 * `shellAppChildRouteDefinitions` / policy `href` values.
 */
export const shellSidebarFeatureSubNav: Partial<
  Record<ShellNavigationItemId, readonly ShellSidebarSubNavEntry[]>
> = {
  events: [
    { labelKey: "nav.sub.events.overview", href: "/app/events" },
    { labelKey: "nav.sub.events.activity", href: "/app/events" },
  ],
  audit: [
    { labelKey: "nav.sub.audit.trail", href: "/app/audit" },
    { labelKey: "nav.sub.audit.exports", href: "/app/audit" },
  ],
  partners: [
    { labelKey: "nav.sub.partners.integrations", href: "/app/partners" },
    { labelKey: "nav.sub.partners.webhooks", href: "/app/partners" },
  ],
}
