export type FinanceSettlementStatus = "pending" | "completed"

export type FinanceSettlementRecord = {
  readonly id: string
  readonly tenantId: string
  readonly settlementNumber: string
  readonly invoiceNumber: string
  readonly counterpartyLabel: string
  readonly status: FinanceSettlementStatus
  readonly amountMinor: number
  readonly currencyCode: string
  readonly dueAt: Date
  readonly settledAt?: Date
  readonly createdAt: Date
}

export type FinanceSettlementDto = {
  readonly id: string
  readonly tenantId: string
  readonly settlementNumber: string
  readonly invoiceNumber: string
  readonly counterpartyLabel: string
  readonly status: FinanceSettlementStatus
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

export const financeSettlementViewPermission =
  "finance:accounting:view" as const
export const financeSettlementWritePermission =
  "finance:settlement:write" as const
