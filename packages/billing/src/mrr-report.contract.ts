import type { BillingCycle, BillingTier } from "./billing-plan.contract"
import type { SubscriptionStatus } from "./subscription.contract"

export type MrrSourceSubscription = {
  readonly tier: BillingTier
  readonly billingCycle: BillingCycle
  readonly amountMinor: number
  readonly status: SubscriptionStatus
}

export type MrrBreakdownEntry = {
  readonly count: number
  readonly mrrMinor: number
}

export type BillingMrrReport = {
  readonly totalMrrMinor: number
  readonly tenantCount: number
  readonly averageRevenuePerTenantMinor: number
  readonly breakdown: Readonly<Record<BillingTier, MrrBreakdownEntry>>
}
