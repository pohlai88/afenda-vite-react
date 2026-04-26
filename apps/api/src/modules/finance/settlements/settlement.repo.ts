import type {
  CreateSettlementInput,
  FinanceSettlementListQuery,
} from "./settlement.schema.js"
import type { FinanceSettlementRecord } from "./settlement.contract.js"

const settlementsByTenant = new Map<string, FinanceSettlementRecord[]>()
let settlementSequence = 600

function nextSettlementId(): string {
  settlementSequence += 1
  return `settle_fin_${settlementSequence}`
}

function nextSettlementNumber(): string {
  settlementSequence += 1
  return `ST-${new Date().getUTCFullYear()}-${String(settlementSequence).padStart(6, "0")}`
}

function seedSettlements(tenantId: string): FinanceSettlementRecord[] {
  return [
    {
      id: nextSettlementId(),
      tenantId,
      settlementNumber: nextSettlementNumber(),
      invoiceNumber: "AF-2026-001001",
      counterpartyLabel: "HSBC Treasury",
      status: "completed",
      amountMinor: 269500,
      currencyCode: "USD",
      dueAt: new Date("2026-04-26T00:00:00.000Z"),
      settledAt: new Date("2026-04-25T10:00:00.000Z"),
      createdAt: new Date("2026-04-24T09:30:00.000Z"),
    },
    {
      id: nextSettlementId(),
      tenantId,
      settlementNumber: nextSettlementNumber(),
      invoiceNumber: "AF-2026-001002",
      counterpartyLabel: "Citi Cash Management",
      status: "pending",
      amountMinor: 96800,
      currencyCode: "USD",
      dueAt: new Date("2026-04-29T00:00:00.000Z"),
      createdAt: new Date("2026-04-25T08:15:00.000Z"),
    },
  ]
}

function getTenantSettlements(tenantId: string): FinanceSettlementRecord[] {
  const existing = settlementsByTenant.get(tenantId)
  if (existing) {
    return existing
  }

  const seeded = seedSettlements(tenantId)
  settlementsByTenant.set(tenantId, seeded)
  return seeded
}

export const financeSettlementRepository = {
  async findMany(
    tenantId: string,
    query: FinanceSettlementListQuery
  ): Promise<FinanceSettlementRecord[]> {
    const search = query.search?.trim().toLowerCase()

    return getTenantSettlements(tenantId)
      .filter((settlement) =>
        query.status ? settlement.status === query.status : true
      )
      .filter((settlement) => {
        if (!search) {
          return true
        }

        return (
          settlement.settlementNumber.toLowerCase().includes(search) ||
          settlement.invoiceNumber.toLowerCase().includes(search) ||
          settlement.counterpartyLabel.toLowerCase().includes(search)
        )
      })
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      )
  },

  async insert(input: {
    readonly tenantId: string
    readonly payload: CreateSettlementInput
  }): Promise<FinanceSettlementRecord> {
    const createdAt = new Date()
    const record: FinanceSettlementRecord = {
      id: nextSettlementId(),
      tenantId: input.tenantId,
      settlementNumber: nextSettlementNumber(),
      invoiceNumber: input.payload.invoiceNumber.trim(),
      counterpartyLabel: input.payload.counterpartyLabel.trim(),
      status: "pending",
      amountMinor: input.payload.amountMinor,
      currencyCode: input.payload.currencyCode.toUpperCase(),
      dueAt: new Date(
        createdAt.getTime() + input.payload.daysUntilDue * 24 * 60 * 60 * 1000
      ),
      createdAt,
    }

    const current = getTenantSettlements(input.tenantId)
    settlementsByTenant.set(input.tenantId, [record, ...current])
    return record
  },
}

export function __resetFinanceSettlementRepoForTests(): void {
  settlementsByTenant.clear()
  settlementSequence = 600
}
