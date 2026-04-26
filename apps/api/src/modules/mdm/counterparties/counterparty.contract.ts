/**
 * Counterparty MDM contracts: canonical API ownership boundary for customer/supplier-like parties.
 * Owns transport-facing types and permission keys; persistence remains behind the repository.
 * module · mdm · counterparties · contract
 * Upstream: counterparty.schema. Downstream: routes, service, web/API consumers.
 * Side effects: none.
 * Coupling: maps onto persisted MDM truth (`mdm.parties`, `mdm.customers`, `mdm.suppliers`) without exposing table details.
 * stable
 * @module modules/mdm/counterparties/counterparty.contract
 * @package @afenda/api
 */
import type {
  Counterparty,
  CounterpartyListQuery,
  CreateCounterpartyInput,
} from "./counterparty.schema.js"

export const mdmCounterpartyViewPermission = "mdm:counterparty:view" as const
export const mdmCounterpartyWritePermission = "mdm:counterparty:write" as const

export type MdmCounterpartyPermission =
  | typeof mdmCounterpartyViewPermission
  | typeof mdmCounterpartyWritePermission

export interface CounterpartyListResponse {
  readonly tenantId: string
  readonly items: readonly Counterparty[]
  readonly query: CounterpartyListQuery
}

export interface CounterpartyDetailResponse {
  readonly tenantId: string
  readonly item: Counterparty
}

export interface CounterpartyCreateResponse {
  readonly tenantId: string
  readonly item: Counterparty
  readonly createdFrom: CreateCounterpartyInput
}
