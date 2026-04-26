import type {
  CreateAllocationInput,
  FinanceAllocationListQuery,
} from "./allocation.schema.js"
import type { FinanceAllocationRecord } from "./allocation.contract.js"

const allocationsByTenant = new Map<string, FinanceAllocationRecord[]>()
let allocationSequence = 400

function nextAllocationId(): string {
  allocationSequence += 1
  return `alloc_fin_${allocationSequence}`
}

function nextAllocationNumber(): string {
  allocationSequence += 1
  return `AL-${new Date().getUTCFullYear()}-${String(allocationSequence).padStart(6, "0")}`
}

function seedAllocations(tenantId: string): FinanceAllocationRecord[] {
  return [
    {
      id: nextAllocationId(),
      tenantId,
      allocationNumber: nextAllocationNumber(),
      invoiceNumber: "AF-2026-001002",
      customerLabel: "Northstar Distribution",
      targetLabel: "Period close support",
      status: "planned",
      amountMinor: 48000,
      currencyCode: "USD",
      allocatedAt: new Date("2026-04-24T11:00:00.000Z"),
      createdAt: new Date("2026-04-24T10:30:00.000Z"),
    },
    {
      id: nextAllocationId(),
      tenantId,
      allocationNumber: nextAllocationNumber(),
      invoiceNumber: "AF-2026-001001",
      customerLabel: "Atlas Retail Group",
      targetLabel: "Revenue clearing",
      status: "allocated",
      amountMinor: 269500,
      currencyCode: "USD",
      allocatedAt: new Date("2026-04-25T08:30:00.000Z"),
      createdAt: new Date("2026-04-25T08:00:00.000Z"),
    },
  ]
}

function getTenantAllocations(tenantId: string): FinanceAllocationRecord[] {
  const existing = allocationsByTenant.get(tenantId)
  if (existing) {
    return existing
  }

  const seeded = seedAllocations(tenantId)
  allocationsByTenant.set(tenantId, seeded)
  return seeded
}

export const financeAllocationRepository = {
  async findMany(
    tenantId: string,
    query: FinanceAllocationListQuery
  ): Promise<FinanceAllocationRecord[]> {
    const search = query.search?.trim().toLowerCase()

    return getTenantAllocations(tenantId)
      .filter((allocation) =>
        query.status ? allocation.status === query.status : true
      )
      .filter((allocation) => {
        if (!search) {
          return true
        }

        return (
          allocation.allocationNumber.toLowerCase().includes(search) ||
          allocation.invoiceNumber.toLowerCase().includes(search) ||
          allocation.customerLabel.toLowerCase().includes(search) ||
          allocation.targetLabel.toLowerCase().includes(search)
        )
      })
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      )
  },

  async insert(input: {
    readonly tenantId: string
    readonly payload: CreateAllocationInput
  }): Promise<FinanceAllocationRecord> {
    const createdAt = new Date()
    const record: FinanceAllocationRecord = {
      id: nextAllocationId(),
      tenantId: input.tenantId,
      allocationNumber: nextAllocationNumber(),
      invoiceNumber: input.payload.invoiceNumber.trim(),
      customerLabel: input.payload.customerLabel.trim(),
      targetLabel: input.payload.targetLabel.trim(),
      status: "planned",
      amountMinor: input.payload.amountMinor,
      currencyCode: input.payload.currencyCode.toUpperCase(),
      allocatedAt: createdAt,
      createdAt,
    }

    const current = getTenantAllocations(input.tenantId)
    allocationsByTenant.set(input.tenantId, [record, ...current])
    return record
  },
}

export function __resetFinanceAllocationRepoForTests(): void {
  allocationsByTenant.clear()
  allocationSequence = 400
}
