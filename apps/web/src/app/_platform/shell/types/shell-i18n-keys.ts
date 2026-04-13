/**
 * Typed `shell` namespace keys for chrome (keeps `t()` aligned with i18n JSON).
 */
export type ShellBreadcrumbLabelKey =
  | "breadcrumb.app"
  | "breadcrumb.events"
  | "breadcrumb.audit"
  | "breadcrumb.partners"

export type ShellNavGroupLabelKey = "nav.groups.workspace"

export type ShellNavItemLabelKey =
  | "nav.items.events"
  | "nav.items.audit"
  | "nav.items.partners"

/** Any `shell` key allowed on breadcrumb / nav label fields (see `ShellBreadcrumbDescriptor.labelKey`). */
export type ShellRouteShellLabelKey =
  | ShellBreadcrumbLabelKey
  | ShellNavItemLabelKey
