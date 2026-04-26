import type {
  FinanceSettlementDto,
  FinanceSettlementListResponse,
  FinanceSettlementRecord,
} from "./settlement.contract.js"
import type {
  CreateSettlementInput,
  FinanceSettlementListQuery,
} from "./settlement.schema.js"
import {
  __resetFinanceSettlementRepoForTests,
  financeSettlementRepository,
} from "./settlement.repo.js"

function toFinanceSettlementDto(
  settlement: FinanceSettlementRecord
): FinanceSettlementDto {
  return {
    id: settlement.id,
    tenantId: settlement.tenantId,
    settlementNumber: settlement.settlementNumber,
    invoiceNumber: settlement.invoiceNumber,
    counterpartyLabel: settlement.counterpartyLabel,
    status: settlement.status,
    amountMinor: settlement.amountMinor,
    currencyCode: settlement.currencyCode,
    dueAt: settlement.dueAt.toISOString(),
    settledAt: settlement.settledAt?.toISOString(),
    createdAt: settlement.createdAt.toISOString(),
  }
}

export async function listFinanceSettlements(input: {
  readonly tenantId: string
  readonly query: FinanceSettlementListQuery
}): Promise<FinanceSettlementListResponse> {
  const items = await financeSettlementRepository.findMany(
    input.tenantId,
    input.query
  )
  return {
    tenantId: input.tenantId,
    items: items.map(toFinanceSettlementDto),
    totalItems: items.length,
    totalAmountMinor: items.reduce((sum, item) => sum + item.amountMinor, 0),
  }
}

export async function createFinanceSettlement(input: {
  readonly tenantId: string
  readonly payload: CreateSettlementInput
}): Promise<FinanceSettlementDto> {
  const item = await financeSettlementRepository.insert(input)
  return toFinanceSettlementDto(item)
}

export function __resetFinanceSettlementsForTests(): void {
  __resetFinanceSettlementRepoForTests()
}
