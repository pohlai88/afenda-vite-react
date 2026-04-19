export {
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

export { RequireAuth } from "./guards/require-auth"
export { RequireGuest } from "./guards/require-guest"

export { RouteAuthUnified } from "./routes/route-auth-unified"
export { RouteAuthCallback } from "./routes/route-auth-callback"
export { AuthLayout } from "./routes/auth-layout"

export { useAuthIntelligence } from "./hooks/use-auth-intelligence"
export { useAuthSessions } from "./hooks/use-auth-sessions"

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

export type { AuthIntelligenceResource } from "./contracts/auth-view-model"
