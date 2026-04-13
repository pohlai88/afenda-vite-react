import type { ShellNavigationGroup } from "../contract/shell-navigation-contract"
import type { ShellNavigationItem } from "../contract/shell-navigation-contract"

export const shellNavigationGroups: readonly ShellNavigationGroup[] = [
  {
    id: "workspace",
    labelKey: "nav.groups.workspace",
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
  },
  {
    id: "partners",
    routeId: "partners",
    href: "/app/partners",
    labelKey: "nav.items.partners",
    iconName: "LinkIcon",
    groupId: "workspace",
    order: 2,
    lifecycle: "active",
  },
]

/**
 * v1: only structural placeholders; most slots unused. Doctrine lives in README.
 */
export const shellSlotActivationV1: Readonly<Record<string, boolean>> = {
  "shell.header.leading": false,
  "shell.header.trailing": true,
  "shell.sidebar.footer": false,
  "shell.content.top": false,
  "shell.overlay.global": false,
}
