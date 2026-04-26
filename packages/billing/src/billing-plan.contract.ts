export type BillingTier = "basic" | "pro" | "enterprise"

export type BillingCycle = "monthly" | "quarterly" | "yearly"

export type SupportLevel = "community" | "email" | "priority" | "dedicated"

export type BillingFeature = {
  readonly key: string
  readonly name: string
  readonly included: boolean
  readonly limit?: number
}

export type BillingPlanLimits = {
  readonly maxUsers: number
  readonly maxStorageGB: number
  readonly maxApiCallsPerMonth: number
  readonly maxAiTokensPerMonth: number
  readonly maxInvoicesPerMonth: number
  readonly maxProducts: number
  readonly maxOrdersPerMonth: number
  readonly maxStorefronts: number
  readonly maxWebhooks: number
  readonly customDomain: boolean
  readonly sla: string
  readonly support: SupportLevel
}

export type BillingPlan = {
  readonly tier: BillingTier
  readonly name: string
  readonly description: string
  readonly currencyCode: string
  readonly pricesMinor: Readonly<Record<BillingCycle, number>>
  readonly features: readonly BillingFeature[]
  readonly limits: BillingPlanLimits
  readonly modules: readonly string[]
}
