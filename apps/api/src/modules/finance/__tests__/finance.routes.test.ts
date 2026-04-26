import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../../app.js"
import { setBetterAuthRuntimeForTests } from "../../../api-auth-runtime.js"
import { __resetFinanceAllocationsForTests } from "../allocations/allocation.service.js"
import { __resetFinanceInvoicesForTests } from "../invoices/invoice.service.js"
import { __resetFinanceSettlementsForTests } from "../settlements/settlement.service.js"

function createRuntimeOverride() {
  return {
    auth: {
      api: {
        getSession: async () => ({
          session: {
            id: "session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            name: "Finance Operator",
            email: "finance@acme.test",
          },
        }),
      },
    } as never,
    db: null as never,
    resolveCommandAuthority: async () => ({
      roles: ["finance_manager"],
      permissions: [
        "finance:accounting:view",
        "finance:invoice:write",
        "finance:allocation:write",
        "finance:settlement:write",
      ],
    }),
    capabilityHooks: {
      passkeyEnabled: true,
      mfaEnabled: true,
      magicLinkEnabled: true,
      agentAuthEnabled: true,
      stepUpPolicy: "risk_based" as const,
      googleOneTapEnabled: false,
      allPluginsEnabled: true,
    },
    listTenantCandidates: async () => ({
      afendaUserId: "afenda-user-1",
      defaultTenantId: "tenant-1",
      candidates: [
        {
          tenantId: "tenant-1",
          membershipId: "membership-1",
          tenantName: "Acme Operations",
          tenantCode: "ACME",
          isDefault: true,
        },
      ],
    }),
    activateTenantContext: async () => ({
      context: {
        authProvider: "better-auth",
        authUserId: "user-1",
        authSessionId: "session-1",
        afendaUserId: "afenda-user-1",
        tenantId: "tenant-1",
        membershipId: "membership-1",
      },
      outgoingHeaders: new Headers(),
    }),
  }
}

describe("finance invoice routes", () => {
  beforeEach(() => {
    __resetFinanceInvoicesForTests()
    __resetFinanceAllocationsForTests()
    __resetFinanceSettlementsForTests()
    setBetterAuthRuntimeForTests(createRuntimeOverride())
  })

  it("lists and creates finance records across the route family", async () => {
    const app = createApp()

    const invoiceListRes = await app.request("/api/v1/finance/invoices", {
      headers: {
        "x-tenant-id": "tenant-1",
      },
    })

    expect(invoiceListRes.status).toBe(200)
    const invoiceListBody = (await invoiceListRes.json()) as {
      ok: boolean
      data: { totalItems: number; items: Array<{ invoiceNumber: string }> }
    }
    expect(invoiceListBody.ok).toBe(true)
    expect(invoiceListBody.data.totalItems).toBeGreaterThan(0)

    const invoiceCreateRes = await app.request("/api/v1/finance/invoices", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        customerLabel: "Southwind Trading",
        currencyCode: "USD",
        taxRate: 0.1,
        daysUntilDue: 10,
        items: [
          {
            description: "Quarter-end close support",
            quantity: 2,
            unitPriceMinor: 75000,
          },
        ],
      }),
    })

    expect(invoiceCreateRes.status).toBe(201)
    const invoiceCreateBody = (await invoiceCreateRes.json()) as {
      ok: boolean
      data: {
        item: { customerLabel: string; status: string; totalMinor: number }
      }
    }
    expect(invoiceCreateBody.ok).toBe(true)
    expect(invoiceCreateBody.data.item.customerLabel).toBe("Southwind Trading")
    expect(invoiceCreateBody.data.item.status).toBe("draft")
    expect(invoiceCreateBody.data.item.totalMinor).toBe(165000)

    const invoiceId = invoiceCreateBody.data.item.id

    const invoiceDetailRes = await app.request(
      `/api/v1/finance/invoices/${invoiceId}`,
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }
    )

    expect(invoiceDetailRes.status).toBe(200)
    const invoiceDetailBody = (await invoiceDetailRes.json()) as {
      ok: boolean
      data: { item: { id: string; status: string; customerLabel: string } }
    }
    expect(invoiceDetailBody.ok).toBe(true)
    expect(invoiceDetailBody.data.item.id).toBe(invoiceId)
    expect(invoiceDetailBody.data.item.status).toBe("draft")

    const invoiceOpenRes = await app.request(
      `/api/v1/finance/invoices/${invoiceId}/open`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }
    )

    expect(invoiceOpenRes.status).toBe(200)
    const invoiceOpenBody = (await invoiceOpenRes.json()) as {
      ok: boolean
      data: { item: { id: string; status: string } }
    }
    expect(invoiceOpenBody.ok).toBe(true)
    expect(invoiceOpenBody.data.item.id).toBe(invoiceId)
    expect(invoiceOpenBody.data.item.status).toBe("open")

    const invoicePaidRes = await app.request(
      `/api/v1/finance/invoices/${invoiceId}/paid`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }
    )

    expect(invoicePaidRes.status).toBe(200)
    const invoicePaidBody = (await invoicePaidRes.json()) as {
      ok: boolean
      data: { item: { id: string; status: string; paidAt?: string } }
    }
    expect(invoicePaidBody.ok).toBe(true)
    expect(invoicePaidBody.data.item.id).toBe(invoiceId)
    expect(invoicePaidBody.data.item.status).toBe("paid")
    expect(invoicePaidBody.data.item.paidAt).toBeTruthy()

    const invalidVoidRes = await app.request(
      `/api/v1/finance/invoices/${invoiceId}/void`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }
    )

    expect(invalidVoidRes.status).toBe(409)

    const allocationListRes = await app.request("/api/v1/finance/allocations", {
      headers: {
        "x-tenant-id": "tenant-1",
      },
    })

    expect(allocationListRes.status).toBe(200)
    const allocationListBody = (await allocationListRes.json()) as {
      ok: boolean
      data: { totalItems: number; items: Array<{ allocationNumber: string }> }
    }
    expect(allocationListBody.ok).toBe(true)
    expect(allocationListBody.data.totalItems).toBeGreaterThan(0)

    const allocationCreateRes = await app.request(
      "/api/v1/finance/allocations",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-tenant-id": "tenant-1",
        },
        body: JSON.stringify({
          invoiceNumber: "AF-2026-001010",
          customerLabel: "Southwind Trading",
          targetLabel: "Collections reserve",
          amountMinor: 55000,
          currencyCode: "USD",
        }),
      }
    )

    expect(allocationCreateRes.status).toBe(201)
    const allocationCreateBody = (await allocationCreateRes.json()) as {
      ok: boolean
      data: {
        item: { targetLabel: string; status: string; amountMinor: number }
      }
    }
    expect(allocationCreateBody.ok).toBe(true)
    expect(allocationCreateBody.data.item.targetLabel).toBe(
      "Collections reserve"
    )
    expect(allocationCreateBody.data.item.status).toBe("planned")
    expect(allocationCreateBody.data.item.amountMinor).toBe(55000)

    const settlementListRes = await app.request("/api/v1/finance/settlements", {
      headers: {
        "x-tenant-id": "tenant-1",
      },
    })

    expect(settlementListRes.status).toBe(200)
    const settlementListBody = (await settlementListRes.json()) as {
      ok: boolean
      data: { totalItems: number; items: Array<{ settlementNumber: string }> }
    }
    expect(settlementListBody.ok).toBe(true)
    expect(settlementListBody.data.totalItems).toBeGreaterThan(0)

    const settlementCreateRes = await app.request(
      "/api/v1/finance/settlements",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-tenant-id": "tenant-1",
        },
        body: JSON.stringify({
          invoiceNumber: "AF-2026-001011",
          counterpartyLabel: "Maybank Treasury",
          amountMinor: 91000,
          currencyCode: "USD",
          daysUntilDue: 4,
        }),
      }
    )

    expect(settlementCreateRes.status).toBe(201)
    const settlementCreateBody = (await settlementCreateRes.json()) as {
      ok: boolean
      data: {
        item: { counterpartyLabel: string; status: string; amountMinor: number }
      }
    }
    expect(settlementCreateBody.ok).toBe(true)
    expect(settlementCreateBody.data.item.counterpartyLabel).toBe(
      "Maybank Treasury"
    )
    expect(settlementCreateBody.data.item.status).toBe("pending")
    expect(settlementCreateBody.data.item.amountMinor).toBe(91000)
  })
})
