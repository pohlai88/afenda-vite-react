import type { AuthIntelligenceSnapshot, AuthRecommendedMethod } from "./auth-domain"

export type AuthMessageTone = "muted" | "success" | "warning" | "destructive"

export interface AuthStatusMessageViewModel {
  readonly tone: AuthMessageTone
  readonly text: string
}

export type AuthIntelligenceResource =
  | {
      readonly status: "loading"
      readonly snapshot: AuthIntelligenceSnapshot
      readonly code: null
    }
  | {
      readonly status: "available"
      readonly snapshot: AuthIntelligenceSnapshot
      readonly code: null
    }
  | {
      readonly status: "unavailable"
      readonly snapshot: AuthIntelligenceSnapshot
      readonly code: string | null
    }

export interface AuthChallengeSummaryViewModel {
  readonly title: string
  readonly description: string
  readonly expiresAtIso?: string
  readonly attemptsRemaining?: number
}

export interface AuthContinuityViewModel {
  readonly currentMethod: AuthRecommendedMethod
  readonly currentStep: "identify" | "method" | "challenge" | "complete"
  readonly challenge: AuthChallengeSummaryViewModel | null
}
