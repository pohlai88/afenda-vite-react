import { getBillingPlan } from "./billing-plan-catalog"
import type { BillingCycle, BillingTier } from "./billing-plan.contract"
import type { BillingInvoice } from "./invoice.contract"
import type {
  BillingMrrReport,
  MrrSourceSubscription,
} from "./mrr-report.contract"
import type {
  BillingSubscription,
  ChangeBillingTierResult,
  CreateBillingSubscriptionInput,
} from "./subscription.contract"

export type BillingLifecycleOptions = {
  readonly now?: () => Date
  readonly createSubscriptionId?: () => string
  readonly createInvoiceId?: () => string
  readonly createInvoiceNumber?: (issuedAt: Date) => string
}

export class BillingLifecycleService {
  private readonly now: () => Date
  private readonly createSubscriptionId: () => string
  private readonly createInvoiceId: () => string
  private readonly createInvoiceNumber: (issuedAt: Date) => string

  constructor(options: BillingLifecycleOptions = {}) {
    this.now = options.now ?? (() => new Date())
    this.createSubscriptionId =
      options.createSubscriptionId ?? (() => `sub_${this.now().getTime()}`)
    this.createInvoiceId =
      options.createInvoiceId ?? (() => `inv_${this.now().getTime()}`)
    this.createInvoiceNumber =
      options.createInvoiceNumber ?? defaultInvoiceNumberFactory
  }

  createSubscription(
    input: CreateBillingSubscriptionInput
  ): BillingSubscription {
    const createdAt = this.now()
    const startAt = input.startAt ?? createdAt
    const plan = getBillingPlan(input.tier)
    const priceMinor = plan.pricesMinor[input.billingCycle]
    const couponDiscountMinor = Math.max(0, input.couponDiscountMinor ?? 0)
    const amountMinor = Math.max(0, priceMinor - couponDiscountMinor)

    return {
      id: this.createSubscriptionId(),
      tenantId: input.tenantId,
      tier: input.tier,
      billingCycle: input.billingCycle,
      status: input.trialDays && input.trialDays > 0 ? "trialing" : "active",
      amountMinor,
      currencyCode: plan.currencyCode,
      currentPeriodStartAt: startAt,
      currentPeriodEndAt: addBillingCycle(startAt, input.billingCycle),
      trialEndAt:
        input.trialDays && input.trialDays > 0
          ? addDays(startAt, input.trialDays)
          : undefined,
      metadata: input.metadata,
      createdAt,
      updatedAt: createdAt,
    }
  }

  changeTier(
    subscription: BillingSubscription,
    newTier: BillingTier,
    prorate = true
  ): ChangeBillingTierResult {
    const effectiveAt = this.now()
    const nextAmountMinor =
      getBillingPlan(newTier).pricesMinor[subscription.billingCycle]
    let proratedCreditMinor: number | undefined
    let proratedChargeMinor: number | undefined

    if (prorate) {
      const totalDays = differenceInWholeDays(
        subscription.currentPeriodStartAt,
        subscription.currentPeriodEndAt
      )
      const remainingDays = differenceInWholeDays(
        effectiveAt,
        subscription.currentPeriodEndAt
      )

      if (totalDays > 0 && remainingDays > 0) {
        proratedCreditMinor = Math.round(
          (subscription.amountMinor / totalDays) * remainingDays
        )
        proratedChargeMinor = Math.round(
          (nextAmountMinor / totalDays) * remainingDays
        )
      }
    }

    return {
      subscription: {
        ...subscription,
        tier: newTier,
        amountMinor: nextAmountMinor,
        updatedAt: effectiveAt,
      },
      effectiveAt,
      proratedCreditMinor,
      proratedChargeMinor,
    }
  }

  cancelSubscription(
    subscription: BillingSubscription,
    reason: string,
    immediate = false
  ): BillingSubscription {
    const cancelledAt = this.now()
    return {
      ...subscription,
      status: immediate ? "cancelled" : subscription.status,
      cancelledAt,
      cancelReason: reason,
      currentPeriodEndAt: immediate
        ? cancelledAt
        : subscription.currentPeriodEndAt,
      updatedAt: cancelledAt,
    }
  }

  renewSubscription(
    subscription: BillingSubscription,
    options: { readonly vatRate?: number } = {}
  ): {
    readonly subscription: BillingSubscription
    readonly invoice: BillingInvoice
  } {
    const issuedAt = this.now()
    const nextPeriodStartAt = subscription.currentPeriodEndAt
    const nextPeriodEndAt = addBillingCycle(
      nextPeriodStartAt,
      subscription.billingCycle
    )
    const vatRate = options.vatRate ?? 0.1
    const taxAmountMinor = Math.round(subscription.amountMinor * vatRate)
    const renewed: BillingSubscription = {
      ...subscription,
      status: "active",
      currentPeriodStartAt: nextPeriodStartAt,
      currentPeriodEndAt: nextPeriodEndAt,
      updatedAt: issuedAt,
    }

    const invoice: BillingInvoice = {
      id: this.createInvoiceId(),
      tenantId: subscription.tenantId,
      subscriptionId: subscription.id,
      invoiceNumber: this.createInvoiceNumber(issuedAt),
      status: "open",
      subtotalMinor: subscription.amountMinor,
      taxAmountMinor,
      totalMinor: subscription.amountMinor + taxAmountMinor,
      currencyCode: subscription.currencyCode,
      periodStartAt: nextPeriodStartAt,
      periodEndAt: nextPeriodEndAt,
      dueAt: addDays(nextPeriodStartAt, 7),
      items: [
        {
          description: `${getBillingPlan(subscription.tier).name} - ${formatBillingCycle(subscription.billingCycle)}`,
          quantity: 1,
          unitPriceMinor: subscription.amountMinor,
          amountMinor: subscription.amountMinor,
        },
      ],
      createdAt: issuedAt,
    }

    return { subscription: renewed, invoice }
  }

  calculateMrr(
    subscriptions: readonly MrrSourceSubscription[]
  ): BillingMrrReport {
    const breakdown: Record<
      "basic" | "pro" | "enterprise",
      { count: number; mrrMinor: number }
    > = {
      basic: { count: 0, mrrMinor: 0 },
      pro: { count: 0, mrrMinor: 0 },
      enterprise: { count: 0, mrrMinor: 0 },
    }

    let totalMrrMinor = 0
    let tenantCount = 0

    for (const subscription of subscriptions) {
      if (
        subscription.status !== "active" &&
        subscription.status !== "trialing"
      ) {
        continue
      }

      const monthlyMinor = normalizeToMonthlyMinor(
        subscription.amountMinor,
        subscription.billingCycle
      )
      totalMrrMinor += monthlyMinor
      tenantCount += 1
      breakdown[subscription.tier] = {
        count: breakdown[subscription.tier].count + 1,
        mrrMinor: breakdown[subscription.tier].mrrMinor + monthlyMinor,
      }
    }

    return {
      totalMrrMinor,
      tenantCount,
      averageRevenuePerTenantMinor:
        tenantCount > 0 ? Math.round(totalMrrMinor / tenantCount) : 0,
      breakdown,
    }
  }
}

export function normalizeToMonthlyMinor(
  amountMinor: number,
  billingCycle: BillingCycle
): number {
  switch (billingCycle) {
    case "quarterly":
      return Math.round(amountMinor / 3)
    case "yearly":
      return Math.round(amountMinor / 12)
    case "monthly":
    default:
      return amountMinor
  }
}

export function formatBillingCycle(cycle: BillingCycle): string {
  switch (cycle) {
    case "monthly":
      return "Monthly"
    case "quarterly":
      return "Quarterly"
    case "yearly":
      return "Yearly"
  }
}

function addBillingCycle(date: Date, cycle: BillingCycle): Date {
  switch (cycle) {
    case "monthly":
      return addMonths(date, 1)
    case "quarterly":
      return addMonths(date, 3)
    case "yearly":
      return addMonths(date, 12)
  }
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}

function differenceInWholeDays(start: Date, end: Date): number {
  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  )
}

function defaultInvoiceNumberFactory(issuedAt: Date): string {
  const year = issuedAt.getUTCFullYear()
  const sequence = `${issuedAt.getTime()}`.slice(-6)
  return `INV-${year}-${sequence.padStart(6, "0")}`
}
