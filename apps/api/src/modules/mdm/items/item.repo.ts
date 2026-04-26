/**
 * Item repository: baseline persistence seam for canonical MDM item master data.
 * module · mdm · items · repository
 * Upstream: item.schema types. Downstream: item.service.
 * Side effects: mutates an in-memory store only.
 * Coupling: uses seed fixtures so the slice is usable before database wiring.
 * experimental
 * @module modules/mdm/items/item.repo
 * @package @afenda/api
 */
import type { CreateItemInput, Item, ItemListQuery } from "./item.schema.js"

export interface ItemRepository {
  findMany(tenantId: string, query: ItemListQuery): Promise<Item[]>
  findById(tenantId: string, itemId: string): Promise<Item | null>
  findByCode(tenantId: string, itemCode: string): Promise<Item | null>
  insert(
    input: CreateItemInput & {
      readonly tenantId: string
      readonly itemCode: string
      readonly canonicalName: string
      readonly itemName: string
    }
  ): Promise<Item>
}

function buildSeedItems(): Item[] {
  return [
    {
      id: "item-resin-pellet",
      tenantId: "tenant-1",
      itemCode: "RM-001",
      itemName: "Resin Pellet",
      canonicalName: "RESIN PELLET",
      itemType: "inventory",
      baseUomCode: "KG",
      categoryCode: "RAW-MATERIAL",
      status: "active",
      createdAt: new Date("2026-04-02T09:00:00.000Z"),
      updatedAt: new Date("2026-04-22T09:00:00.000Z"),
    },
    {
      id: "item-shipping-service",
      tenantId: "tenant-1",
      itemCode: "SERV-SHIPPING",
      itemName: "Shipping Service",
      canonicalName: "SHIPPING SERVICE",
      itemType: "service",
      baseUomCode: "JOB",
      status: "active",
      createdAt: new Date("2026-04-03T09:00:00.000Z"),
      updatedAt: new Date("2026-04-23T09:00:00.000Z"),
    },
    {
      id: "item-demo-ten-2",
      tenantId: "tenant-2",
      itemCode: "FG-100",
      itemName: "Finished Syrup",
      canonicalName: "FINISHED SYRUP",
      itemType: "inventory",
      baseUomCode: "CASE",
      categoryCode: "FINISHED-GOODS",
      status: "active",
      createdAt: new Date("2026-04-04T09:00:00.000Z"),
      updatedAt: new Date("2026-04-24T09:00:00.000Z"),
    },
  ]
}

class InMemoryItemRepository implements ItemRepository {
  private readonly items = new Map<string, Item>()

  constructor() {
    this.resetToSeedData()
  }

  async findMany(tenantId: string, query: ItemListQuery): Promise<Item[]> {
    const normalizedSearch = query.search?.trim().toLowerCase()

    return Array.from(this.items.values())
      .filter((item) => item.tenantId === tenantId)
      .filter((item) =>
        query.itemType === undefined ? true : item.itemType === query.itemType
      )
      .filter((item) =>
        query.status === undefined ? true : item.status === query.status
      )
      .filter((item) =>
        query.categoryCode === undefined
          ? true
          : item.categoryCode === query.categoryCode
      )
      .filter((item) => {
        if (!normalizedSearch) {
          return true
        }

        return [
          item.itemCode,
          item.itemName,
          item.canonicalName,
          item.categoryCode,
        ]
          .filter((value): value is string => typeof value === "string")
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      })
      .sort((left, right) => left.itemName.localeCompare(right.itemName))
  }

  async findById(tenantId: string, itemId: string): Promise<Item | null> {
    const record = this.items.get(itemId)
    if (!record || record.tenantId !== tenantId) {
      return null
    }

    return record
  }

  async findByCode(tenantId: string, itemCode: string): Promise<Item | null> {
    const normalized = itemCode.trim().toUpperCase()

    for (const item of this.items.values()) {
      if (
        item.tenantId === tenantId &&
        item.itemCode.toUpperCase() === normalized
      ) {
        return item
      }
    }

    return null
  }

  async insert(
    input: CreateItemInput & {
      readonly tenantId: string
      readonly itemCode: string
      readonly canonicalName: string
      readonly itemName: string
    }
  ): Promise<Item> {
    const now = new Date()
    const record: Item = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      itemCode: input.itemCode,
      itemName: input.itemName,
      canonicalName: input.canonicalName,
      itemType: input.itemType,
      baseUomCode: input.baseUomCode,
      categoryCode: input.categoryCode,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    }

    this.items.set(record.id, record)
    return record
  }

  resetToSeedData(): void {
    this.items.clear()
    for (const item of buildSeedItems()) {
      this.items.set(item.id, item)
    }
  }
}

const inMemoryItemRepository = new InMemoryItemRepository()

export const itemRepository: ItemRepository = inMemoryItemRepository

export function __resetItemRepoForTests(): void {
  inMemoryItemRepository.resetToSeedData()
}
