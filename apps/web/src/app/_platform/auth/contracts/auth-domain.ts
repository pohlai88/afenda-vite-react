export type AuthTrustLevel = "low" | "medium" | "high" | "verified"

export type AuthRiskReasonSeverity = "info" | "warning" | "danger"

export interface AuthRiskReason {
  readonly code: string
  readonly label: string
  readonly severity: AuthRiskReasonSeverity
}

export type AuthRecommendedMethod = "passkey" | "password" | "social"

/** Identifiers for tenant-scoped auth method policy (UI); aligns with Better Auth capabilities. */
export type AuthMethodId =
  | "password"
  | "social"
  | "passkey"
  | "username"
  | "magic_link"
  | "email_otp"
  | "device_code"
  | "oauth_generic"

export type AuthStepUpPolicy = "off" | "risk_based"

export interface AuthIntelligenceSnapshot {
  readonly trustLevel: AuthTrustLevel
  readonly score: number
  readonly deviceLabel: string
  readonly regionLabel: string
  readonly lastSeenLabel: string
  readonly reasons: readonly AuthRiskReason[]
  readonly passkeyAvailable: boolean
  readonly recommendedMethod: AuthRecommendedMethod
  readonly stepUpPolicy: AuthStepUpPolicy
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
