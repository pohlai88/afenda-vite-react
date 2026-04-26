export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible"

export type BillingInvoiceItem = {
  readonly description: string
  readonly quantity: number
  readonly unitPriceMinor: number
  readonly amountMinor: number
}

export type BillingInvoice = {
  readonly id: string
  readonly tenantId: string
  readonly subscriptionId: string
  readonly invoiceNumber: string
  readonly status: InvoiceStatus
  readonly subtotalMinor: number
  readonly taxAmountMinor: number
  readonly totalMinor: number
  readonly currencyCode: string
  readonly periodStartAt: Date
  readonly periodEndAt: Date
  readonly dueAt: Date
  readonly paidAt?: Date
  readonly items: readonly BillingInvoiceItem[]
  readonly createdAt: Date
}
