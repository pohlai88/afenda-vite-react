/**
 * Counterparty repository: baseline persistence seam for the canonical MDM counterparty surface.
 * Uses an in-memory store now; swap to Drizzle/Postgres without changing route/service ownership.
 * module · mdm · counterparties · repository
 * Upstream: counterparty.schema types. Downstream: counterparty.service.
 * Side effects: mutates an in-memory store only.
 * Coupling: seeded fixtures keep dev/runtime language aligned with the existing counterparty shell surface.
 * experimental
 * @module modules/mdm/counterparties/counterparty.repo
 * @package @afenda/api
 */
import type {
  Counterparty,
  CounterpartyListQuery,
  CreateCounterpartyInput,
} from "./counterparty.schema.js"

export interface CounterpartyRepository {
  findMany(
    tenantId: string,
    query: CounterpartyListQuery
  ): Promise<Counterparty[]>
  findById(
    tenantId: string,
    counterpartyId: string
  ): Promise<Counterparty | null>
  findByCode(tenantId: string, code: string): Promise<Counterparty | null>
  insert(
    input: CreateCounterpartyInput & {
      readonly tenantId: string
      readonly code: string
      readonly canonicalName: string
      readonly displayName: string
    }
  ): Promise<Counterparty>
}

function buildSeedCounterparties(): Counterparty[] {
  return [
    {
      id: "counterparty-northstar",
      tenantId: "tenant-1",
      code: "NORTHSTAR-LOGISTICS",
      displayName: "Northstar Logistics",
      canonicalName: "NORTHSTAR LOGISTICS",
      kind: "supplier",
      status: "active",
      email: "ops@northstar.test",
      phone: "+66-1000-1000",
      taxRegistrationNumber: "TH-NS-001",
      aliases: ["Northstar"],
      createdAt: new Date("2026-04-01T09:00:00.000Z"),
      updatedAt: new Date("2026-04-20T09:00:00.000Z"),
    },
    {
      id: "counterparty-atlas",
      tenantId: "tenant-1",
      code: "ATLAS-COMMERCE",
      displayName: "Atlas Commerce",
      canonicalName: "ATLAS COMMERCE",
      kind: "customer",
      status: "active",
      email: "finance@atlas.test",
      phone: "+66-1000-2000",
      taxRegistrationNumber: "TH-AT-002",
      aliases: ["Atlas"],
      createdAt: new Date("2026-04-02T09:00:00.000Z"),
      updatedAt: new Date("2026-04-21T09:00:00.000Z"),
    },
    {
      id: "counterparty-civic",
      tenantId: "tenant-1",
      code: "CIVIC-RETAIL",
      displayName: "Civic Retail",
      canonicalName: "CIVIC RETAIL",
      kind: "hybrid",
      status: "blocked",
      email: "desk@civic.test",
      phone: "+66-1000-3000",
      taxRegistrationNumber: "TH-CV-003",
      aliases: [],
      createdAt: new Date("2026-04-03T09:00:00.000Z"),
      updatedAt: new Date("2026-04-22T09:00:00.000Z"),
    },
    {
      id: "counterparty-meridian",
      tenantId: "tenant-1",
      code: "MERIDIAN-DISTRIBUTION",
      displayName: "Meridian Distribution",
      canonicalName: "MERIDIAN DISTRIBUTION",
      kind: "supplier",
      status: "inactive",
      email: "team@meridian.test",
      phone: "+66-1000-4000",
      taxRegistrationNumber: "TH-MD-004",
      aliases: ["Meridian"],
      createdAt: new Date("2026-04-04T09:00:00.000Z"),
      updatedAt: new Date("2026-04-23T09:00:00.000Z"),
    },
    {
      id: "counterparty-harbor",
      tenantId: "tenant-2",
      code: "HARBOR-SUPPLY",
      displayName: "Harbor Supply",
      canonicalName: "HARBOR SUPPLY",
      kind: "supplier",
      status: "active",
      email: "hello@harbor.test",
      phone: "+66-2000-1000",
      taxRegistrationNumber: "TH-HS-005",
      aliases: [],
      createdAt: new Date("2026-04-05T09:00:00.000Z"),
      updatedAt: new Date("2026-04-24T09:00:00.000Z"),
    },
  ]
}

class InMemoryCounterpartyRepository implements CounterpartyRepository {
  private readonly counterparties = new Map<string, Counterparty>()

  constructor() {
    this.resetToSeedData()
  }

  async findMany(
    tenantId: string,
    query: CounterpartyListQuery
  ): Promise<Counterparty[]> {
    const normalizedSearch = query.search?.trim().toLowerCase()

    return Array.from(this.counterparties.values())
      .filter((counterparty) => counterparty.tenantId === tenantId)
      .filter((counterparty) =>
        query.kind === undefined ? true : counterparty.kind === query.kind
      )
      .filter((counterparty) =>
        query.status === undefined ? true : counterparty.status === query.status
      )
      .filter((counterparty) => {
        if (!normalizedSearch) {
          return true
        }

        const haystack = [
          counterparty.code,
          counterparty.displayName,
          counterparty.canonicalName,
          counterparty.email,
          ...counterparty.aliases,
        ]
          .filter((value): value is string => typeof value === "string")
          .join(" ")
          .toLowerCase()

        return haystack.includes(normalizedSearch)
      })
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
  }

  async findById(
    tenantId: string,
    counterpartyId: string
  ): Promise<Counterparty | null> {
    const record = this.counterparties.get(counterpartyId)
    if (!record || record.tenantId !== tenantId) {
      return null
    }

    return record
  }

  async findByCode(
    tenantId: string,
    code: string
  ): Promise<Counterparty | null> {
    const normalized = code.trim().toUpperCase()

    for (const counterparty of this.counterparties.values()) {
      if (
        counterparty.tenantId === tenantId &&
        counterparty.code.toUpperCase() === normalized
      ) {
        return counterparty
      }
    }

    return null
  }

  async insert(
    input: CreateCounterpartyInput & {
      readonly tenantId: string
      readonly code: string
      readonly canonicalName: string
      readonly displayName: string
    }
  ): Promise<Counterparty> {
    const now = new Date()
    const record: Counterparty = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      code: input.code,
      displayName: input.displayName,
      canonicalName: input.canonicalName,
      kind: input.kind,
      status: input.status,
      email: input.email,
      phone: input.phone,
      taxRegistrationNumber: input.taxRegistrationNumber,
      aliases: input.aliases,
      createdAt: now,
      updatedAt: now,
    }

    this.counterparties.set(record.id, record)
    return record
  }

  resetToSeedData(): void {
    this.counterparties.clear()
    for (const counterparty of buildSeedCounterparties()) {
      this.counterparties.set(counterparty.id, counterparty)
    }
  }
}

const inMemoryCounterpartyRepository = new InMemoryCounterpartyRepository()

export const counterpartyRepository: CounterpartyRepository =
  inMemoryCounterpartyRepository

export function __resetCounterpartyRepoForTests(): void {
  inMemoryCounterpartyRepository.resetToSeedData()
}
