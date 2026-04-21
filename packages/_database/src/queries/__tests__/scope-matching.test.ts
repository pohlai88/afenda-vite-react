/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/__tests__/scope-matching.test.ts` — Vitest for `query-primitives/scope-matching`.
 */
import { describe, expect, it } from "vitest"

import { matchesScope } from "../query-primitives/scope-matching"

const base = {
  tenantId: "t1",
  legalEntityId: "le1",
  businessUnitId: "bu1",
  locationId: "loc1",
}

describe("matchesScope", () => {
  it("tenant scope matches regardless of ids", () => {
    expect(
      matchesScope({
        ...base,
        scopeType: "tenant",
        scopeId: null,
        legalEntityId: "other",
      })
    ).toBe(true)
  })

  it("legal_entity requires scopeId === legalEntityId", () => {
    expect(
      matchesScope({
        ...base,
        scopeType: "legal_entity",
        scopeId: "le1",
      })
    ).toBe(true)
    expect(
      matchesScope({
        ...base,
        scopeType: "legal_entity",
        scopeId: "le2",
      })
    ).toBe(false)
    expect(
      matchesScope({
        ...base,
        scopeType: "legal_entity",
        scopeId: null,
      })
    ).toBe(false)
  })

  it("business_unit requires scopeId === businessUnitId", () => {
    expect(
      matchesScope({
        ...base,
        scopeType: "business_unit",
        scopeId: "bu1",
      })
    ).toBe(true)
    expect(
      matchesScope({
        ...base,
        scopeType: "business_unit",
        scopeId: "bu2",
      })
    ).toBe(false)
  })

  it("returns false for non-exhaustive scopeType at runtime", () => {
    expect(
      matchesScope({
        ...base,
        scopeType: "invalid" as never,
        scopeId: "x",
      })
    ).toBe(false)
  })

  it("location requires scopeId === locationId", () => {
    expect(
      matchesScope({
        ...base,
        scopeType: "location",
        scopeId: "loc1",
      })
    ).toBe(true)
    expect(
      matchesScope({
        ...base,
        scopeType: "location",
        scopeId: "loc2",
      })
    ).toBe(false)
  })
})
