export {
  authOrganizationClient,
  authClient,
  getAfendaAuthStepUpPolicy,
  useAfendaSession,
} from "./auth-client"
export {
  authAccountSettingsAbsoluteUrl,
  authAppCallbackUrl,
  authPasswordResetRedirectUrl,
  authPostAccountDeletionAbsoluteUrl,
  authPostLoginPath,
} from "./auth-redirect-urls"

export { AUTH_ROUTES } from "./auth-paths"
export { SETUP_ROUTES } from "./setup-paths"

export { RequireAuth } from "./guards/require-auth"
export { RequireGuest } from "./guards/require-guest"
export { RequireAppReady } from "./guards/require-app-ready"
export { RequireSetupRoute } from "./guards/require-setup-route"
export { AfendaAuthUiProvider } from "./better-auth-ui/afenda-auth-ui-provider"

export { AuthLayout } from "./routes/auth-layout"
export { authRouteObjects } from "./routes/route-auth"
export { setupRouteObject } from "./routes/route-setup"

export { useAuthIntelligence } from "./hooks/use-auth-intelligence"
export { useAuthPostLoginDestination } from "./hooks/use-auth-post-login-destination"
export { useAuthSetupState } from "./hooks/use-auth-setup-state"
export { useAuthSessions } from "./hooks/use-auth-sessions"
export {
  activateAuthTenantContext,
  listAuthTenantCandidates,
} from "./services/auth-tenant-context-service"
export {
  AuthServiceError,
  resolveAuthErrorCode,
} from "./services/auth-error-service"
export { mapAuthErrorToUserMessage } from "./mappers/map-auth-error-to-user-message"

export type {
  AuthTrustLevel,
  AuthRiskReasonSeverity,
  AuthRiskReason,
  AuthRecommendedMethod,
  AuthMethodId,
  AuthStepUpPolicy,
  AuthIntelligenceSnapshot,
  AuthSessionRisk,
  AuthSessionItem,
  AuthSessionsPayload,
} from "./contracts/auth-domain"

export type {
  AuthApiMeta,
  AuthApiSuccessEnvelope,
  AuthApiErrorEnvelope,
  AuthApiEnvelope,
} from "./contracts/auth-api"

export type { AuthReturnTarget } from "./contracts/auth-return-target"
export type {
  AuthSetupSnapshot,
  ResolveSetupStateOptions,
  SetupState,
} from "./contracts/auth-setup-state"

export type { AuthIntelligenceResource } from "./contracts/auth-view-model"
export type {
  AuthTenantCandidate,
  AuthTenantCandidatePayload,
  AuthTenantContextPayload,
} from "./services/auth-tenant-context-service"
