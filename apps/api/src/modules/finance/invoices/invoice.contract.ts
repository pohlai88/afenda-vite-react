import type {
  BillingInvoice,
  BillingInvoiceItem,
  InvoiceStatus,
} from "@afenda/billing"

export type FinanceInvoiceRecord = BillingInvoice & {
  readonly customerLabel: string
}

export type FinanceInvoiceDto = {
  readonly id: string
  readonly tenantId: string
  readonly subscriptionId: string
  readonly invoiceNumber: string
  readonly customerLabel: string
  readonly status: InvoiceStatus
  readonly subtotalMinor: number
  readonly taxAmountMinor: number
  readonly totalMinor: number
  readonly currencyCode: string
  readonly periodStartAt: string
  readonly periodEndAt: string
  readonly dueAt: string
  readonly paidAt?: string
  readonly items: readonly BillingInvoiceItem[]
  readonly createdAt: string
}

export type FinanceInvoiceListResponse = {
  readonly tenantId: string
  readonly items: readonly FinanceInvoiceDto[]
  readonly totalItems: number
  readonly totalAmountMinor: number
}

export type FinanceInvoiceTransition = "open" | "paid" | "void"

export const financeInvoiceViewPermission = "finance:accounting:view" as const
export const financeInvoiceWritePermission = "finance:invoice:write" as const
