/**
 * Counterparty service: canonical MDM orchestration for the first master-data slice.
 * Owns normalization and uniqueness rules; repository owns persistence only.
 * module · mdm · counterparties · service
 * Upstream: counterparty repo/schema/policy, api-errors. Downstream: routes, tests.
 * Side effects: via repository only.
 * Coupling: this is the canonical write/read boundary for counterparties; operations remains projection-only.
 * experimental
 * @module modules/mdm/counterparties/counterparty.service
 * @package @afenda/api
 */
import { conflict, notFound } from "../../../api-errors.js"
import type {
  CounterpartyListQuery,
  Counterparty,
  CreateCounterpartyInput,
} from "./counterparty.schema.js"
import {
  normalizeCounterpartyCanonicalName,
  normalizeCounterpartyCode,
  normalizeCounterpartyDisplayName,
} from "./counterparty-normalization.policy.js"
import {
  __resetCounterpartyRepoForTests,
  counterpartyRepository,
} from "./counterparty.repo.js"

export async function listCounterparties(input: {
  readonly tenantId: string
  readonly query: CounterpartyListQuery
}): Promise<Counterparty[]> {
  return counterpartyRepository.findMany(input.tenantId, input.query)
}

export async function getCounterparty(input: {
  readonly tenantId: string
  readonly counterpartyId: string
}): Promise<Counterparty> {
  const counterparty = await counterpartyRepository.findById(
    input.tenantId,
    input.counterpartyId
  )

  if (!counterparty) {
    throw notFound("Counterparty not found.", {
      counterpartyId: input.counterpartyId,
      tenantId: input.tenantId,
    })
  }

  return counterparty
}

export async function createCounterparty(input: {
  readonly tenantId: string
  readonly payload: CreateCounterpartyInput
}): Promise<Counterparty> {
  const displayName = normalizeCounterpartyDisplayName(
    input.payload.displayName
  )
  const canonicalName = normalizeCounterpartyCanonicalName(
    input.payload.canonicalName ?? input.payload.displayName
  )
  const code = normalizeCounterpartyCode({
    code: input.payload.code,
    displayName,
  })

  const existing = await counterpartyRepository.findByCode(input.tenantId, code)
  if (existing) {
    throw conflict("A counterparty with this code already exists.", {
      tenantId: input.tenantId,
      code,
    })
  }

  return counterpartyRepository.insert({
    ...input.payload,
    tenantId: input.tenantId,
    displayName,
    canonicalName,
    code,
  })
}

export function __resetCounterpartiesForTests(): void {
  __resetCounterpartyRepoForTests()
}
