import type {
  ShellNavigationGroup,
  ShellNavigationItem,
} from "../contract/shell-navigation-contract"

export const shellNavigationGroups: readonly ShellNavigationGroup[] = [
  {
    id: "workspace",
    labelKey: "nav.workspace.placeholder_title",
    order: 0,
  },
]

/**
 * Canonical navigation config (runtime). Filtering is advisory — see `filterShellNavigationItems`.
 */
export const shellNavigationItems: readonly ShellNavigationItem[] = [
  {
    id: "events",
    routeId: "events",
    href: "/app/events",
    labelKey: "nav.items.events",
    iconName: "ListIcon",
    groupId: "workspace",
    order: 0,
    lifecycle: "active",
    permissionKeys: ["ops:event:view"],
  },
  {
    id: "audit",
    routeId: "audit",
    href: "/app/audit",
    labelKey: "nav.items.audit",
    iconName: "ShieldIcon",
    groupId: "workspace",
    order: 1,
    lifecycle: "active",
    permissionKeys: ["ops:audit:view"],
  },
  {
    id: "counterparties",
    routeId: "counterparties",
    href: "/app/counterparties",
    labelKey: "nav.items.counterparties",
    iconName: "LinkIcon",
    groupId: "workspace",
    order: 2,
    lifecycle: "active",
    permissionKeys: ["ops:event:view"],
  },
  {
    id: "db_studio",
    routeId: "db_studio",
    href: "/app/db-studio",
    labelKey: "nav.items.db_studio",
    iconName: "DatabaseIcon",
    groupId: "workspace",
    order: 3,
    lifecycle: "active",
    isEnabled: false,
    permissionKeys: ["admin:workspace:manage"],
  },
  {
    id: "my_project",
    routeId: "my_project",
    href: "/app/events",
    labelKey: "nav.items.my_project",
    iconName: "LayoutGridIcon",
    groupId: "workspace",
    order: 4,
    lifecycle: "comingSoon",
  },
  {
    id: "my_team",
    routeId: "my_team",
    href: "/app/events",
    labelKey: "nav.items.my_team",
    iconName: "UsersIcon",
    groupId: "workspace",
    order: 5,
    lifecycle: "comingSoon",
  },
  {
    id: "my_report",
    routeId: "my_report",
    href: "/app/events",
    labelKey: "nav.items.my_report",
    iconName: "FileBarChartIcon",
    groupId: "workspace",
    order: 6,
    lifecycle: "comingSoon",
  },
  {
    id: "my_claim",
    routeId: "my_claim",
    href: "/app/events",
    labelKey: "nav.items.my_claim",
    iconName: "FileTextIcon",
    groupId: "workspace",
    order: 7,
    lifecycle: "comingSoon",
  },
]

/**
 * v1: only structural placeholders; most slots unused. Doctrine lives in README.
 */
export const shellSlotActivationV1: Readonly<Record<string, boolean>> = {
  "shell.header.leading": false,
  "shell.header.trailing": true,
  "shell.sidebar.footer": true,
  "shell.content.top": false,
  "shell.overlay.global": false,
}
