/**
 * Typed `shell` namespace keys for chrome (keeps `t()` aligned with i18n JSON).
 */
export type ShellBreadcrumbLabelKey =
  | "breadcrumb.app"
  | "breadcrumb.events"
  | "breadcrumb.audit"
  | "breadcrumb.partners"

export type ShellNavGroupLabelKey =
  | "nav.workspace.placeholder_title"
  | "nav.workspace.section_primary"
  | "nav.workspace.section_operations"
  | "nav.workspace.section_insights"
  | "nav.workspace.section_app"

/** Sub-link labels (route metadata / i18n; labels column nav removed). */
export type ShellNavSidebarSubLabelKey =
  | "nav.sub.events.overview"
  | "nav.sub.events.activity"
  | "nav.sub.audit.trail"
  | "nav.sub.audit.exports"
  | "nav.sub.partners.integrations"
  | "nav.sub.partners.webhooks"

export type ShellNavItemLabelKey =
  | "nav.items.events"
  | "nav.items.audit"
  | "nav.items.partners"
  | "nav.items.my_project"
  | "nav.items.my_team"
  | "nav.items.my_report"
  | "nav.items.my_claim"

/** Rail widget titles (emoji slots); distinct from feature template titles in `nav.items.*`. */
export type ShellNavWidgetLabelKey =
  | "nav.widgets.my_erp"
  | "nav.widgets.my_portal"
  | "nav.widgets.my_task"
  | "nav.widgets.my_project"
  | "nav.widgets.my_team"
  | "nav.widgets.my_report"
  | "nav.widgets.my_claim"
  | "nav.widgets.add"
  | "nav.widgets.customize"
  | "nav.widgets.empty_title"
  | "nav.widgets.empty_description"

/** Any `shell` key allowed on breadcrumb / nav label fields (see `ShellBreadcrumbDescriptor.labelKey`). */
export type ShellRouteShellLabelKey =
  | ShellBreadcrumbLabelKey
  | ShellNavItemLabelKey
  | ShellNavWidgetLabelKey
  | ShellNavSidebarSubLabelKey
