import type { PromotionReadinessStatus } from "../status/status.js"

export interface PromotionReadinessCheck {
  readonly key: string
  readonly title: string
  readonly status: PromotionReadinessStatus
  readonly message: string
  readonly evidence: readonly string[]
}

export interface PromotionReadinessReport {
  readonly status: PromotionReadinessStatus
  readonly generatedAt: string
  readonly domainId: "GOV-TRUTH-001"
  readonly scorecard: {
    readonly totalChecks: number
    readonly passCount: number
    readonly warnCount: number
    readonly failCount: number
    readonly readyForPromotion: boolean
  }
  readonly checks: readonly PromotionReadinessCheck[]
}
