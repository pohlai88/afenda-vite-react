import type { BillingCycle, BillingTier } from "./billing-plan.contract"

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "suspended"
  | "expired"

export type BillingSubscription = {
  readonly id: string
  readonly tenantId: string
  readonly tier: BillingTier
  readonly billingCycle: BillingCycle
  readonly status: SubscriptionStatus
  readonly amountMinor: number
  readonly currencyCode: string
  readonly currentPeriodStartAt: Date
  readonly currentPeriodEndAt: Date
  readonly trialEndAt?: Date
  readonly cancelledAt?: Date
  readonly cancelReason?: string
  readonly metadata?: Readonly<Record<string, unknown>>
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type CreateBillingSubscriptionInput = {
  readonly tenantId: string
  readonly tier: BillingTier
  readonly billingCycle: BillingCycle
  readonly startAt?: Date
  readonly trialDays?: number
  readonly couponDiscountMinor?: number
  readonly metadata?: Readonly<Record<string, unknown>>
}

export type ChangeBillingTierResult = {
  readonly subscription: BillingSubscription
  readonly effectiveAt: Date
  readonly proratedCreditMinor?: number
  readonly proratedChargeMinor?: number
}
