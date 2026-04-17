export type AuthTrustLevel = "low" | "medium" | "high" | "verified"
export type AuthRiskReasonSeverity = "info" | "warning" | "danger"

export interface AuthRiskReason {
  readonly code: string
  readonly label: string
  readonly severity: AuthRiskReasonSeverity
}

export interface AuthIntelligenceSnapshot {
  readonly trustLevel: AuthTrustLevel
  readonly score: number
  readonly deviceLabel: string
  readonly regionLabel: string
  readonly lastSeenLabel: string
  readonly reasons: readonly AuthRiskReason[]
  readonly passkeyAvailable: boolean
  readonly recommendedMethod: "passkey" | "password" | "social"
}

export interface AuthSessionItem {
  readonly id: string
  readonly device: string
  readonly location: string
  readonly createdAt: string
  readonly lastActiveAt: string
  readonly isCurrent: boolean
  readonly risk: "low" | "medium" | "high"
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

export {
  authFail as authErrorEnvelope,
  authOk as authSuccessEnvelope,
} from "./modules/auth-companion/contracts/auth-api.contract.js"

export { buildAuthIntelligenceSnapshot } from "./modules/auth-companion/services/build-auth-intelligence-snapshot.js"
