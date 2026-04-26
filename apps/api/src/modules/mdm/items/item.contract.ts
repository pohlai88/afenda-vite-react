/**
 * Item MDM contracts: canonical API ownership boundary for item master data.
 * module · mdm · items · contract
 * Upstream: item.schema. Downstream: routes, service, web/API consumers.
 * Side effects: none.
 * Coupling: maps onto persisted MDM item truth without exposing storage details.
 * experimental
 * @module modules/mdm/items/item.contract
 * @package @afenda/api
 */
import type { CreateItemInput, Item, ItemListQuery } from "./item.schema.js"

export const mdmItemViewPermission = "mdm:item:view" as const
export const mdmItemWritePermission = "mdm:item:write" as const

export type MdmItemPermission =
  | typeof mdmItemViewPermission
  | typeof mdmItemWritePermission

export interface ItemListResponse {
  readonly tenantId: string
  readonly items: readonly Item[]
  readonly query: ItemListQuery
}

export interface ItemDetailResponse {
  readonly tenantId: string
  readonly item: Item
}

export interface ItemCreateResponse {
  readonly tenantId: string
  readonly item: Item
  readonly createdFrom: CreateItemInput
}
