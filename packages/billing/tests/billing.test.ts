import { describe, expect, it } from "vitest"

import { getBillingPlan } from "../src/billing-plan-catalog"
import {
  BillingLifecycleService,
  formatBillingCycle,
  normalizeToMonthlyMinor,
} from "../src/billing-lifecycle.service"

describe("@afenda/billing", () => {
  it("exposes a plan catalog with stable commercial prices", () => {
    expect(getBillingPlan("basic")).toMatchObject({
      currencyCode: "VND",
      pricesMinor: { monthly: 990000 },
    })
    expect(getBillingPlan("enterprise").limits.customDomain).toBe(true)
  })

  it("creates subscriptions with optional trial and discount handling", () => {
    const service = new BillingLifecycleService({
      now: () => new Date("2026-04-25T00:00:00.000Z"),
      createSubscriptionId: () => "sub_001",
    })

    const subscription = service.createSubscription({
      tenantId: "tenant_1",
      tier: "pro",
      billingCycle: "monthly",
      trialDays: 14,
      couponDiscountMinor: 100000,
    })

    expect(subscription).toMatchObject({
      id: "sub_001",
      status: "trialing",
      amountMinor: 2890000,
    })
    expect(subscription.trialEndAt?.toISOString()).toBe(
      "2026-05-09T00:00:00.000Z"
    )
  })

  it("calculates prorated upgrade values", () => {
    const service = new BillingLifecycleService({
      now: () => new Date("2026-04-16T00:00:00.000Z"),
    })

    const changed = service.changeTier(
      {
        id: "sub_1",
        tenantId: "tenant_1",
        tier: "basic",
        billingCycle: "monthly",
        status: "active",
        amountMinor: 990000,
        currencyCode: "VND",
        currentPeriodStartAt: new Date("2026-04-01T00:00:00.000Z"),
        currentPeriodEndAt: new Date("2026-05-01T00:00:00.000Z"),
        createdAt: new Date("2026-04-01T00:00:00.000Z"),
        updatedAt: new Date("2026-04-01T00:00:00.000Z"),
      },
      "pro"
    )

    expect(changed.subscription.tier).toBe("pro")
    expect(changed.proratedCreditMinor).toBeGreaterThan(0)
    expect(changed.proratedChargeMinor).toBeGreaterThan(
      changed.proratedCreditMinor ?? 0
    )
  })

  it("renews subscriptions and generates invoice truth", () => {
    const service = new BillingLifecycleService({
      now: () => new Date("2026-04-25T00:00:00.000Z"),
      createInvoiceId: () => "inv_001",
      createInvoiceNumber: () => "INV-2026-000001",
    })

    const result = service.renewSubscription({
      id: "sub_1",
      tenantId: "tenant_1",
      tier: "basic",
      billingCycle: "monthly",
      status: "active",
      amountMinor: 990000,
      currencyCode: "VND",
      currentPeriodStartAt: new Date("2026-04-01T00:00:00.000Z"),
      currentPeriodEndAt: new Date("2026-05-01T00:00:00.000Z"),
      createdAt: new Date("2026-04-01T00:00:00.000Z"),
      updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    })

    expect(result.subscription.currentPeriodStartAt.toISOString()).toBe(
      "2026-05-01T00:00:00.000Z"
    )
    expect(result.invoice).toMatchObject({
      id: "inv_001",
      invoiceNumber: "INV-2026-000001",
      subtotalMinor: 990000,
      taxAmountMinor: 99000,
      totalMinor: 1089000,
    })
  })

  it("normalizes MRR across mixed billing cycles", () => {
    const service = new BillingLifecycleService()
    const report = service.calculateMrr([
      {
        tier: "basic",
        billingCycle: "monthly",
        amountMinor: 990000,
        status: "active",
      },
      {
        tier: "pro",
        billingCycle: "quarterly",
        amountMinor: 8070000,
        status: "active",
      },
      {
        tier: "enterprise",
        billingCycle: "yearly",
        amountMinor: 76700000,
        status: "trialing",
      },
      {
        tier: "basic",
        billingCycle: "monthly",
        amountMinor: 990000,
        status: "cancelled",
      },
    ])

    expect(normalizeToMonthlyMinor(8070000, "quarterly")).toBe(2690000)
    expect(formatBillingCycle("yearly")).toBe("Yearly")
    expect(report.totalMrrMinor).toBe(10071667)
    expect(report.tenantCount).toBe(3)
    expect(report.breakdown.pro.mrrMinor).toBe(2690000)
  })
})
