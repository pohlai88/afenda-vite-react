import { getSharedApiClient, resolveApiV1Path } from "@/app/_platform/runtime"

export type FinanceInvoiceItemDto = {
  readonly description: string
  readonly quantity: number
  readonly unitPriceMinor: number
  readonly amountMinor: number
}

export type FinanceInvoiceDto = {
  readonly id: string
  readonly tenantId: string
  readonly subscriptionId: string
  readonly invoiceNumber: string
  readonly customerLabel: string
  readonly status: "draft" | "open" | "paid" | "void" | "uncollectible"
  readonly subtotalMinor: number
  readonly taxAmountMinor: number
  readonly totalMinor: number
  readonly currencyCode: string
  readonly periodStartAt: string
  readonly periodEndAt: string
  readonly dueAt: string
  readonly paidAt?: string
  readonly items: readonly FinanceInvoiceItemDto[]
  readonly createdAt: string
}

export type FinanceInvoiceListResponse = {
  readonly tenantId: string
  readonly items: readonly FinanceInvoiceDto[]
  readonly totalItems: number
  readonly totalAmountMinor: number
}

export type FinanceAllocationDto = {
  readonly id: string
  readonly tenantId: string
  readonly allocationNumber: string
  readonly invoiceNumber: string
  readonly customerLabel: string
  readonly targetLabel: string
  readonly status: "planned" | "allocated" | "released"
  readonly amountMinor: number
  readonly currencyCode: string
  readonly allocatedAt: string
  readonly createdAt: string
}

export type FinanceAllocationListResponse = {
  readonly tenantId: string
  readonly items: readonly FinanceAllocationDto[]
  readonly totalItems: number
  readonly totalAmountMinor: number
}

export type FinanceSettlementDto = {
  readonly id: string
  readonly tenantId: string
  readonly settlementNumber: string
  readonly invoiceNumber: string
  readonly counterpartyLabel: string
  readonly status: "pending" | "completed"
  readonly amountMinor: number
  readonly currencyCode: string
  readonly dueAt: string
  readonly settledAt?: string
  readonly createdAt: string
}

export type FinanceSettlementListResponse = {
  readonly tenantId: string
  readonly items: readonly FinanceSettlementDto[]
  readonly totalItems: number
  readonly totalAmountMinor: number
}

type SuccessEnvelope<T> = {
  readonly ok: true
  readonly data: T
}

export interface CreateFinanceInvoiceInput extends Record<string, unknown> {
  readonly customerLabel: string
  readonly currencyCode: string
  readonly taxRate: number
  readonly daysUntilDue: number
  readonly items: ReadonlyArray<{
    readonly description: string
    readonly quantity: number
    readonly unitPriceMinor: number
  }>
}

export async function fetchFinanceInvoices(
  tenantHeaders: Record<string, string>
): Promise<FinanceInvoiceListResponse> {
  const client = getSharedApiClient()
  const envelope = await client.get<
    SuccessEnvelope<FinanceInvoiceListResponse>
  >(resolveApiV1Path("/finance/invoices"), {
    headers: tenantHeaders,
  })

  return envelope.data
}

export async function createFinanceInvoice(
  payload: CreateFinanceInvoiceInput,
  tenantHeaders: Record<string, string>
): Promise<FinanceInvoiceDto> {
  const client = getSharedApiClient()
  const envelope = await client.post<
    SuccessEnvelope<{
      tenantId: string
      item: FinanceInvoiceDto
    }>
  >(resolveApiV1Path("/finance/invoices"), payload, {
    headers: tenantHeaders,
  })

  return envelope.data.item
}

export async function fetchFinanceAllocations(
  tenantHeaders: Record<string, string>
): Promise<FinanceAllocationListResponse> {
  const client = getSharedApiClient()
  const envelope = await client.get<
    SuccessEnvelope<FinanceAllocationListResponse>
  >(resolveApiV1Path("/finance/allocations"), {
    headers: tenantHeaders,
  })

  return envelope.data
}

export async function fetchFinanceSettlements(
  tenantHeaders: Record<string, string>
): Promise<FinanceSettlementListResponse> {
  const client = getSharedApiClient()
  const envelope = await client.get<
    SuccessEnvelope<FinanceSettlementListResponse>
  >(resolveApiV1Path("/finance/settlements"), {
    headers: tenantHeaders,
  })

  return envelope.data
}
