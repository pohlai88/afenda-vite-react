export type {
  ResolveShellBreadcrumbsOptions,
  ShellBreadcrumbDescriptor,
  ShellBreadcrumbKind,
  ShellBreadcrumbResolvedItem,
} from "./contract/shell-breadcrumb-contract"
export type {
  ResolveShellHeaderActionsOptions,
  ShellHeaderActionDescriptor,
  ShellHeaderActionKind,
  ShellHeaderActionResolvedItem,
  ShellHeaderActionTone,
  ShellHeaderActionVisibility,
} from "./contract/shell-header-action-contract"
export type {
  ShellCommandAuthorize,
  ShellCommandDefinition,
  ShellCommandHandler,
  ShellCommandId,
} from "./contract/shell-command-contract"
export type {
  ShellCommandExecutionContext,
  ShellCommandExecutionFailure,
  ShellCommandExecutionResult,
  ShellCommandExecutionSuccess,
} from "./contract/shell-command-execution-contract"
export type {
  ShellCommandBannerPort,
  ShellCommandBannerShowInput,
  ShellCommandFeedbackContext,
  ShellCommandFeedbackIntent,
  ShellCommandFeedbackPlan,
  ShellCommandFeedbackSurface,
  ShellCommandInlineFeedbackPort,
  ShellCommandInlineShowInput,
} from "./contract/shell-command-feedback-contract"
export type {
  ShellInteractionAuditEnvelope,
  ShellInteractionKind,
  ShellInteractionMechanism,
  ShellInteractionPhase,
} from "./contract/shell-interaction-audit-contract"
export type {
  ShellCommandConcurrencyPolicy,
  ShellCommandInteractionContext,
  ShellCommandInteractionIntent,
  ShellCommandInteractionPolicy,
  ShellCommandInteractionState,
  ShellCommandPresentationPolicy,
} from "./contract/shell-command-interaction-contract"
export type {
  ShellCommandMessageDescriptor,
  ResolveShellCommandMessageOptions,
} from "./contract/shell-command-message-contract"
export type {
  ShellCommandOutcome,
  ShellCommandOutcomeCategory,
  ShellCommandOutcomeSeverity,
  ShellCommandOutcomeStatus,
} from "./contract/shell-command-outcome-contract"
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
export type {
  ShellRouteCoverageMetadata,
  ShellRouteMetadata,
} from "./contract/shell-route-metadata-contract"
export type { ShellMetadataTrace } from "./types/shell-metadata-trace"

export { ShellCommandError } from "./errors/shell-command-error"
export { ShellCommandConflictError } from "./errors/shell-command-conflict-error"
export { ShellCommandInvariantError } from "./errors/shell-command-invariant-error"
export { ShellCommandNotFoundError } from "./errors/shell-command-not-found-error"
export { ShellCommandSystemError } from "./errors/shell-command-system-error"
export { ShellCommandUnauthorizedError } from "./errors/shell-command-unauthorized-error"
export { ShellCommandValidationError } from "./errors/shell-command-validation-error"

export { AppShellLayout, ShellLeftSidebarLayout } from "./components/shell-left-sidebar-block"
export { ShellTopNav, type ShellTopNavProps } from "./components/shell-top-nav-block"
export { AppShellNotFound } from "./components/app-shell-not-found"
export {
  AppShellSidebar,
  ShellLeftSidebar,
} from "./components/shell-left-sidebar-block"
export { ShellIcon, ShellNavIcon } from "./components/shell-icon"
export type { ShellIconProps, ShellNavIconProps } from "./components/shell-icon"
export { shellIconNames, shellNavIconNames } from "./constants/shell-icon-names"
export type { ShellIconName, ShellNavIconName } from "./constants/shell-icon-names"

export { useCurrentShellRoute } from "./hooks/use-current-shell-route"
export { useShellBreadcrumbs } from "./hooks/use-shell-breadcrumbs"
export { useShellMetadata } from "./hooks/use-shell-metadata"
export {
  useShellRouteMeta,
  useShellRouteResolution,
} from "./hooks/use-shell-route-meta"
export { useShellTitle } from "./hooks/use-shell-title"
export { useShellHeaderActions } from "./hooks/use-shell-header-actions"
export { useShellCommandExecutor } from "./hooks/use-shell-command-executor"
export { useShellCommandActivity } from "./hooks/use-shell-command-activity"
export {
  useShellCommandRunner,
  type ShellCommandRunner,
  type ShellCommandRunnerContext,
  type ShellCommandRunnerResult,
} from "./hooks/use-shell-command-runner"
export { useShellCommandInteraction } from "./hooks/use-shell-command-interaction"
export type {
  ShellCommandRunResult,
  UseShellCommandInteractionResult,
} from "./hooks/use-shell-command-interaction"
export { useBannerPort } from "./hooks/use-banner-port"
export { useShellCommandFeedback } from "./hooks/use-shell-command-feedback"
export type { ShellCommandFeedback } from "./hooks/use-shell-command-feedback"
export { useInlineFeedbackPort } from "./hooks/use-inline-feedback-port"
export { useToastPort } from "./hooks/use-toast-port"

export { shellNavigationItems } from "./policy/shell-navigation-policy"

export type {
  ShellCommandActivityState,
  ShellCommandActivityStore,
} from "./store/shell-command-activity-store"
export { createShellCommandActivityStore } from "./store/shell-command-activity-store"
export { shellCommandActivityStore } from "./store/shell-command-activity-store-instance"

export {
  shellAppChildPath,
  shellAppChildPathSegments,
  shellAppChildRouteDefinitions,
  shellAppDefaultChildSegment,
  shellAppLayoutRoute,
  shellAppNotFoundRoute,
  shellRouteMetadataList,
} from "./routes/shell-route-definitions"
export { shellWorkspaceHomeHref } from "./routes/shell-route-constants"
export {
  shellUserMenuFallbackLinks,
  type ShellUserMenuLinkKey,
} from "./routes/shell-user-menu-route-map"

export {
  assertShellRouteCatalog,
  collectShellRouteCatalogIssues,
  mapShellMetadataValidationToShellInvariant,
} from "./services/assert-shell-route-catalog"
export {
  assertShellResolutionCoverage,
  collectShellResolutionCoverageIssues,
} from "./services/assert-shell-resolution-coverage"
export { assertShellMetadata } from "./services/assert-shell-metadata"
export { createShellInvariantError } from "./services/shell-invariant-error-map"
export { ShellInvariantError } from "./services/shell-invariant-error"
export type { BuildShellResolutionTraceOptions } from "./services/build-shell-resolution-trace"
export { buildShellResolutionTrace } from "./services/build-shell-resolution-trace"
export type {
  BuildShellValidationReportOptions,
  ShellResolutionTraceRecord,
  ShellValidationReport,
  ShellValidationReportDoctrine,
  ShellValidationReportSchemaVersion,
  ShellValidationReportSummary,
} from "./services/shell-validation-report"
export {
  buildShellValidationReport,
  SHELL_VALIDATION_REPORT_SCHEMA_VERSION,
  shellValidationReportDoctrine,
} from "./services/shell-validation-report"
export type {
  ShellValidationReportDiff,
  ShellValidationReportIssueDelta,
  ShellValidationReportSampleDelta,
  ShellValidationReportTraceChange,
} from "./services/shell-validation-report-diff-contract"
export { diffShellValidationReports } from "./services/shell-validation-report-diff"
export { formatShellValidationReportDiff } from "./services/format-shell-validation-report-diff"
export type {
  ShellTraceExpectation,
  ShellValidationTraceSamples,
} from "./services/shell-validation-trace-samples"
export { buildShellValidationTraceSamples } from "./services/build-shell-validation-trace-samples"
export type {
  ShellCommandAuditAdapter,
  ShellCommandExecutor,
} from "./services/create-shell-command-executor"
export { createShellCommandExecutor } from "./services/create-shell-command-executor"
export { classifyShellCommandOutcome } from "./services/classify-shell-command-outcome"
export type { ClassifyShellCommandOutcomeOptions } from "./services/classify-shell-command-outcome"
export { resolveShellCommandMessage } from "./services/resolve-shell-command-message"
export { resolveShellCommandFeedbackPlan } from "./services/resolve-shell-command-feedback-plan"
export type { ResolveShellCommandFeedbackPlanOptions } from "./services/resolve-shell-command-feedback-plan"
export { resolveShellCommandInteractionPolicy } from "./services/resolve-shell-command-interaction-policy"
export type { ShellCommandInteractionController } from "./services/create-shell-command-interaction-controller"
export { createShellCommandInteractionController } from "./services/create-shell-command-interaction-controller"
export type {
  EmitShellCommandToastOptions,
  ShellCommandToastPort,
} from "./services/shell-command-toast-adapter"
export { emitShellCommandToast } from "./services/shell-command-toast-adapter"
export { translateShellCommandOutcome } from "./services/translate-shell-command-outcome"
export type { TranslateShellCommandOutcomeOptions } from "./services/translate-shell-command-outcome"
export type {
  ShellCommandDispatchFields,
  ShellCommandDispatcher,
} from "./services/create-shell-command-dispatcher"
export { createShellCommandDispatcher } from "./services/create-shell-command-dispatcher"
export {
  consoleShellCommandAuditAdapter,
  createDefaultShellCommandAuditAdapter,
} from "./services/shell-command-audit-adapter"
export { buildShellCommandInteractionEnvelope } from "./services/build-shell-command-interaction-envelope"
export {
  mapShellInteractionAuditPayload,
  SHELL_INTERACTION_AUDIT_ACTION,
} from "./services/map-shell-interaction-audit-payload"
export type { ShellInteractionAuditRequestBody } from "./services/map-shell-interaction-audit-payload"
export {
  emitShellInteractionAudit,
  type EmitShellInteractionAuditOptions,
} from "./services/shell-interaction-audit-adapter"
export { filterShellNavigationItems } from "./services/filter-shell-navigation-items"
export { resolveShellBreadcrumbs } from "./services/resolve-shell-breadcrumbs"
export { resolveShellHeaderActions } from "./services/resolve-shell-header-actions"
export type { ResolveShellMetadataOptions } from "./services/resolve-shell-metadata"
export { resolveShellMetadata } from "./services/resolve-shell-metadata"
export type { ResolveShellTitleOptions } from "./services/resolve-shell-title"
export { resolveShellTitle } from "./services/resolve-shell-title"
export type { ShellMetadataValidationIssue } from "./services/validate-shell-metadata"
export { validateShellMetadata } from "./services/validate-shell-metadata"

export type { ShellCommandRegistry } from "./registry/shell-command-registry"
export { createShellCommandRegistry } from "./registry/shell-command-registry"
export { shellCommandRegistry } from "./registry/shell-command-registry-instance"

export { translateShellNamespaceKey } from "./utils/translate-shell-namespace-key"
