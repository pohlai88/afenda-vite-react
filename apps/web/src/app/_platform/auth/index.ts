export { authClient, useAfendaSession } from "./auth-client"
export {
  authAppCallbackUrl,
  authPasswordResetRedirectUrl,
  authPostLoginPath,
} from "./auth-redirect-urls"

export { AUTH_ROUTES } from "./auth-paths"

export { RequireAuth } from "./guards/require-auth"
export { RequireGuest } from "./guards/require-guest"

export { RouteAuthLogin } from "./routes/route-auth-login"
export { RouteAuthRegister } from "./routes/route-auth-register"
export { RouteAuthForgotPassword } from "./routes/route-auth-forgot-password"
export { RouteAuthResetPassword } from "./routes/route-auth-reset-password"
export { RouteAuthCallback } from "./routes/route-auth-callback"

export { useAuthIntelligence } from "./hooks/use-auth-intelligence"
export { useAuthSessions } from "./hooks/use-auth-sessions"

export type {
  AuthTrustLevel,
  AuthRiskReasonSeverity,
  AuthRiskReason,
  AuthRecommendedMethod,
  AuthIntelligenceSnapshot,
  AuthChallengeType,
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
  AuthChallengeMethod,
  AuthChallengeTicket,
  AuthChallengePrompt,
  AuthChallengeStartPayload,
  AuthChallengeVerifyPayload,
} from "./contracts/auth-challenge-ticket"
export type {
  AuthContinuityViewModel,
  AuthIntelligenceResource,
  AuthMessageTone,
  AuthStatusMessageViewModel,
} from "./contracts/auth-view-model"
