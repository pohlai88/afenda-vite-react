import type {
  FinanceAllocationDto,
  FinanceAllocationListResponse,
  FinanceAllocationRecord,
} from "./allocation.contract.js"
import type {
  CreateAllocationInput,
  FinanceAllocationListQuery,
} from "./allocation.schema.js"
import {
  __resetFinanceAllocationRepoForTests,
  financeAllocationRepository,
} from "./allocation.repo.js"

function toFinanceAllocationDto(
  allocation: FinanceAllocationRecord
): FinanceAllocationDto {
  return {
    id: allocation.id,
    tenantId: allocation.tenantId,
    allocationNumber: allocation.allocationNumber,
    invoiceNumber: allocation.invoiceNumber,
    customerLabel: allocation.customerLabel,
    targetLabel: allocation.targetLabel,
    status: allocation.status,
    amountMinor: allocation.amountMinor,
    currencyCode: allocation.currencyCode,
    allocatedAt: allocation.allocatedAt.toISOString(),
    createdAt: allocation.createdAt.toISOString(),
  }
}

export async function listFinanceAllocations(input: {
  readonly tenantId: string
  readonly query: FinanceAllocationListQuery
}): Promise<FinanceAllocationListResponse> {
  const items = await financeAllocationRepository.findMany(
    input.tenantId,
    input.query
  )
  return {
    tenantId: input.tenantId,
    items: items.map(toFinanceAllocationDto),
    totalItems: items.length,
    totalAmountMinor: items.reduce((sum, item) => sum + item.amountMinor, 0),
  }
}

export async function createFinanceAllocation(input: {
  readonly tenantId: string
  readonly payload: CreateAllocationInput
}): Promise<FinanceAllocationDto> {
  const item = await financeAllocationRepository.insert(input)
  return toFinanceAllocationDto(item)
}

export function __resetFinanceAllocationsForTests(): void {
  __resetFinanceAllocationRepoForTests()
}
