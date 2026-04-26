import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FinancePage } from "../finance-page"

vi.mock("react-i18next", () => ({
  useTranslation: (namespace?: string) => ({
    t: (key: string, options?: Record<string, string | number | undefined>) => {
      if (key === "total.message") {
        return `${options?.count ?? 0} invoices`
      }
      return `${namespace ?? "default"}:${key}`
    },
  }),
}))

vi.mock("../use-finance-invoices", () => ({
  useFinanceInvoices: () => ({
    data: {
      tenantId: "tenant-1",
      totalItems: 2,
      totalAmountMinor: 366300,
      items: [
        {
          id: "inv-1",
          tenantId: "tenant-1",
          subscriptionId: "finance-manual",
          invoiceNumber: "AF-2026-001001",
          customerLabel: "Atlas Retail Group",
          status: "open",
          subtotalMinor: 245000,
          taxAmountMinor: 24500,
          totalMinor: 269500,
          currencyCode: "USD",
          periodStartAt: "2026-04-01T00:00:00.000Z",
          periodEndAt: "2026-04-30T00:00:00.000Z",
          dueAt: "2026-05-02T00:00:00.000Z",
          createdAt: "2026-04-25T09:00:00.000Z",
          items: [],
        },
      ],
    },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    createInvoice: vi.fn(),
    isCreatingInvoice: false,
  }),
}))

vi.mock("../use-finance-allocations", () => ({
  useFinanceAllocations: () => ({
    data: {
      tenantId: "tenant-1",
      totalItems: 2,
      totalAmountMinor: 317500,
      items: [
        {
          id: "alloc-1",
          tenantId: "tenant-1",
          allocationNumber: "AL-2026-000401",
          invoiceNumber: "AF-2026-001001",
          customerLabel: "Atlas Retail Group",
          targetLabel: "Revenue clearing",
          status: "allocated",
          amountMinor: 269500,
          currencyCode: "USD",
          allocatedAt: "2026-04-25T08:30:00.000Z",
          createdAt: "2026-04-25T08:00:00.000Z",
        },
      ],
    },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("../use-finance-settlements", () => ({
  useFinanceSettlements: () => ({
    data: {
      tenantId: "tenant-1",
      totalItems: 2,
      totalAmountMinor: 366300,
      items: [
        {
          id: "settle-1",
          tenantId: "tenant-1",
          settlementNumber: "ST-2026-000601",
          invoiceNumber: "AF-2026-001001",
          counterpartyLabel: "HSBC Treasury",
          status: "completed",
          amountMinor: 269500,
          currencyCode: "USD",
          dueAt: "2026-04-26T00:00:00.000Z",
          settledAt: "2026-04-25T10:00:00.000Z",
          createdAt: "2026-04-24T09:30:00.000Z",
        },
      ],
    },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

describe("FinancePage", () => {
  it("renders overview and finance tabs", () => {
    render(<FinancePage />)

    expect(
      screen.getByText("shell:erp_module.finance.page.title")
    ).toBeInTheDocument()
    expect(screen.getByText("2 invoices")).toBeInTheDocument()
    expect(
      screen.getByRole("tab", { name: "shell:finance_tabs.allocations" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("allocation:summary.description")
    ).toBeInTheDocument()
    expect(
      screen.getByText("settlement:summary.description")
    ).toBeInTheDocument()
  })

  it("exposes the finance workspace tabs and overview summaries", () => {
    render(<FinancePage />)

    expect(
      screen.getByRole("tab", { name: "shell:finance_tabs.invoices" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("tab", { name: "shell:finance_tabs.settlements" })
    ).toBeInTheDocument()
    expect(screen.getByText("Atlas Retail Group")).toBeInTheDocument()
    expect(screen.getByText("HSBC Treasury")).toBeInTheDocument()
  })
})
