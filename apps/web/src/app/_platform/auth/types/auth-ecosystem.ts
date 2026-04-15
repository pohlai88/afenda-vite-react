export type AuthTrustLevel = "low" | "medium" | "high" | "verified"

export type AuthRiskReasonSeverity = "info" | "warning" | "danger"

export interface AuthRiskReason {
  readonly code: string
  readonly label: string
  readonly severity: AuthRiskReasonSeverity
}

export type AuthRecommendedMethod = "passkey" | "password" | "social"

export interface AuthIntelligenceSnapshot {
  readonly trustLevel: AuthTrustLevel
  readonly score: number
  readonly deviceLabel: string
  readonly regionLabel: string
  readonly lastSeenLabel: string
  readonly reasons: readonly AuthRiskReason[]
  readonly passkeyAvailable: boolean
  readonly recommendedMethod: AuthRecommendedMethod
}

export type AuthChallengeType =
  | "password"
  | "totp"
  | "email_otp"
  | "passkey_assertion"

export interface AuthChallengeState {
  readonly challengeId: string
  readonly type: AuthChallengeType
  readonly expiresAt: string
  readonly attemptsRemaining: number
}

export type AuthSessionRisk = "low" | "medium" | "high"

export interface AuthSessionItem {
  readonly id: string
  readonly device: string
  readonly location: string
  readonly createdAt: string
  readonly lastActiveAt: string
  readonly isCurrent: boolean
  readonly risk: AuthSessionRisk
}

export interface AuthSessionsPayload {
  readonly sessions: readonly AuthSessionItem[]
  readonly factors: {
    readonly password: boolean
    readonly social: boolean
    readonly passkey: boolean
    readonly mfa: boolean
  }
  readonly recentEvents: readonly {
    readonly id: string
    readonly title: string
    readonly timeLabel: string
  }[]
}

export interface AuthApiMeta {
  readonly timestamp: string
  readonly requestId?: string
}

export interface AuthApiSuccessEnvelope<T> {
  readonly data: T
  readonly meta: AuthApiMeta
}

export interface AuthApiErrorEnvelope {
  readonly error: {
    readonly code: string
    readonly message: string
  }
}

export type AuthApiEnvelope<T> =
  | AuthApiSuccessEnvelope<T>
  | AuthApiErrorEnvelope

export function isAuthApiErrorEnvelope<T>(
  payload: AuthApiEnvelope<T>
): payload is AuthApiErrorEnvelope {
  return "error" in payload
}
