/**
 * Item service: canonical MDM orchestration for the item master-data slice.
 * module · mdm · items · service
 * Upstream: item repo/schema/policy, api-errors. Downstream: routes, legacy ingest, tests.
 * Side effects: via repository only.
 * Coupling: this is the canonical write/read boundary for item master data.
 * experimental
 * @module modules/mdm/items/item.service
 * @package @afenda/api
 */
import { conflict, notFound } from "../../../api-errors.js"
import type { CreateItemInput, Item, ItemListQuery } from "./item.schema.js"
import {
  normalizeItemCanonicalName,
  normalizeItemCode,
  normalizeItemName,
  normalizeItemUomCode,
} from "./item-normalization.policy.js"
import { __resetItemRepoForTests, itemRepository } from "./item.repo.js"

export async function listItems(input: {
  readonly tenantId: string
  readonly query: ItemListQuery
}): Promise<Item[]> {
  return itemRepository.findMany(input.tenantId, input.query)
}

export async function getItem(input: {
  readonly tenantId: string
  readonly itemId: string
}): Promise<Item> {
  const item = await itemRepository.findById(input.tenantId, input.itemId)

  if (!item) {
    throw notFound("Item not found.", {
      itemId: input.itemId,
      tenantId: input.tenantId,
    })
  }

  return item
}

export async function createItem(input: {
  readonly tenantId: string
  readonly payload: CreateItemInput
}): Promise<Item> {
  const itemName = normalizeItemName(input.payload.itemName)
  const canonicalName = normalizeItemCanonicalName(
    input.payload.canonicalName ?? input.payload.itemName
  )
  const itemCode = normalizeItemCode({
    itemCode: input.payload.itemCode,
    itemName,
  })

  const existing = await itemRepository.findByCode(input.tenantId, itemCode)
  if (existing) {
    throw conflict("An item with this code already exists.", {
      tenantId: input.tenantId,
      itemCode,
    })
  }

  return itemRepository.insert({
    ...input.payload,
    tenantId: input.tenantId,
    itemCode,
    itemName,
    canonicalName,
    baseUomCode: normalizeItemUomCode(input.payload.baseUomCode),
  })
}

export function __resetItemsForTests(): void {
  __resetItemRepoForTests()
}
