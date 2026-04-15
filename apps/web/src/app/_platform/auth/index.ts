import { authClient } from "./auth-client"

export { AuthChallengeCanvas } from "./auth-challenge-canvas"
export { AuthCommandShell } from "./auth-command-shell"
export { IdentityIntelligenceHud } from "./identity-intelligence-hud"
export { MarketingAuthShell } from "./marketing-auth-shell"
export { RequireAuth } from "./require-auth"
export { SessionContinuityPanel } from "./session-continuity-panel"

export { authClient }
export {
  authAppCallbackUrl,
  authPasswordResetRedirectUrl,
  authPostLoginPath,
} from "./auth-redirect-urls"
export { useAuthIntelligence } from "./hooks/use-auth-intelligence"
export { useAuthSessions } from "./hooks/use-auth-sessions"
export {
  authFlowQueryToString,
  authFlowReducer,
  authFlowStateToQuery,
  createInitialAuthFlowState,
} from "./services/auth-flow-orchestrator"
export {
  fetchAuthIntelligenceSnapshot,
  fetchAuthSessionsPayload,
  resolveAuthErrorCode,
  revokeAuthSession,
  verifyAuthChallenge,
} from "./services/auth-ecosystem-service"
export type {
  AuthApiEnvelope,
  AuthApiErrorEnvelope,
  AuthApiMeta,
  AuthApiSuccessEnvelope,
  AuthChallengeState,
  AuthChallengeType,
  AuthIntelligenceSnapshot,
  AuthRecommendedMethod,
  AuthRiskReason,
  AuthRiskReasonSeverity,
  AuthSessionItem,
  AuthSessionRisk,
  AuthSessionsPayload,
  AuthTrustLevel,
} from "./types/auth-ecosystem"

/** Same reactive session hook as `authClient.useSession` — stable export for route guards and chrome. */
export const useAfendaSession = authClient.useSession
