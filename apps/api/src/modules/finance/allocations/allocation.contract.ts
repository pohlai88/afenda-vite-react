export type FinanceAllocationStatus = "planned" | "allocated" | "released"

export type FinanceAllocationRecord = {
  readonly id: string
  readonly tenantId: string
  readonly allocationNumber: string
  readonly invoiceNumber: string
  readonly customerLabel: string
  readonly targetLabel: string
  readonly status: FinanceAllocationStatus
  readonly amountMinor: number
  readonly currencyCode: string
  readonly allocatedAt: Date
  readonly createdAt: Date
}

export type FinanceAllocationDto = {
  readonly id: string
  readonly tenantId: string
  readonly allocationNumber: string
  readonly invoiceNumber: string
  readonly customerLabel: string
  readonly targetLabel: string
  readonly status: FinanceAllocationStatus
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

export const financeAllocationViewPermission =
  "finance:accounting:view" as const
export const financeAllocationWritePermission =
  "finance:allocation:write" as const
