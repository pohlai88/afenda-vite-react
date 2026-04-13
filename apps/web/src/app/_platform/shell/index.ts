export type {
  ResolveShellBreadcrumbsOptions,
  ShellBreadcrumbDescriptor,
  ShellBreadcrumbKind,
  ShellBreadcrumbResolvedItem,
} from "./contract/shell-breadcrumb-contract"
export type {
  ResolveShellHeaderActionsOptions,
  ShellHeaderActionDescriptor,
  ShellHeaderActionEmphasis,
  ShellHeaderActionKind,
  ShellHeaderActionResolvedItem,
} from "./contract/shell-header-action-contract"
export type { ShellMetadata } from "./contract/shell-metadata-contract"
export type { ShellMetadataValidationCode } from "./contract/shell-metadata-validation-codes"
export {
  shellMetadataValidationCodeList,
  shellMetadataValidationCodes,
} from "./contract/shell-metadata-validation-codes"
export type { ShellInvariantCode } from "./contract/shell-invariant-codes"
export {
  shellInvariantCodeRegistry,
  shellInvariantSeverityValues,
} from "./contract/shell-invariant-codes"
export type {
  ShellInvariantIssue,
  ShellInvariantSeverity,
} from "./contract/shell-invariant-contract"
export type {
  ShellNavigationGroup,
  ShellNavigationItem,
} from "./contract/shell-navigation-contract"
export type { ShellRouteMetadata } from "./contract/shell-route-metadata-contract"
export type { ShellMetadataTrace } from "./types/shell-metadata-trace"

export { AppShellBreadcrumb } from "./components/app-shell-breadcrumb"
export { AppShellHeaderActions } from "./components/app-shell-header-actions"
export { AppShellHeader } from "./components/app-shell-header"
export { AppShellLayout } from "./components/app-shell-layout"
export { AppShellNotFound } from "./components/app-shell-not-found"
export { AppShellSidebar } from "./components/app-shell-sidebar"

export { useCurrentShellRoute } from "./hooks/use-current-shell-route"
export { useShellBreadcrumbs } from "./hooks/use-shell-breadcrumbs"
export { useShellMetadata } from "./hooks/use-shell-metadata"
export {
  useShellRouteMeta,
  useShellRouteResolution,
} from "./hooks/use-shell-route-meta"
export { useShellTitle } from "./hooks/use-shell-title"
export { useShellHeaderActions } from "./hooks/use-shell-header-actions"

export { shellNavigationItems } from "./policy/shell-navigation-policy"

export {
  shellAppChildPath,
  shellAppChildPathSegments,
  shellAppChildRouteDefinitions,
  shellAppDefaultChildSegment,
  shellAppLayoutRoute,
  shellAppNotFoundRoute,
  shellRouteMetadataList,
} from "./routes/shell-route-definitions"

export {
  assertShellRouteCatalog,
  collectShellRouteCatalogIssues,
  mapShellMetadataValidationToShellInvariant,
} from "./services/assert-shell-route-catalog"
export { assertShellMetadata } from "./services/assert-shell-metadata"
export { createShellInvariantError } from "./services/shell-invariant-error-map"
export { ShellInvariantError } from "./services/shell-invariant-error"
export type {
  BuildShellValidationReportOptions,
  ShellResolutionTraceRecord,
  ShellValidationReport,
  ShellValidationReportSummary,
} from "./services/shell-validation-report"
export { buildShellValidationReport } from "./services/shell-validation-report"
export { filterShellNavigationItems } from "./services/filter-shell-navigation-items"
export { resolveShellBreadcrumbs } from "./services/resolve-shell-breadcrumbs"
export { resolveShellHeaderActions } from "./services/resolve-shell-header-actions"
export type { ResolveShellMetadataOptions } from "./services/resolve-shell-metadata"
export { resolveShellMetadata } from "./services/resolve-shell-metadata"
export type { ResolveShellTitleOptions } from "./services/resolve-shell-title"
export { resolveShellTitle } from "./services/resolve-shell-title"
export type { ShellMetadataValidationIssue } from "./services/validate-shell-metadata"
export { validateShellMetadata } from "./services/validate-shell-metadata"

export { translateShellNamespaceKey } from "./utils/translate-shell-namespace-key"
