/**
 * Vitest: {@link ../relation-names} — F1 disambiguated Drizzle relation names.
 */
import { describe, expect, it } from "vitest"

import {
  DRIZZLE_RELATION_NAME,
  type DrizzleDisambiguatedRelationName,
} from "../relation-names"

describe("DRIZZLE_RELATION_NAME (F1)", () => {
  it("defines stable tenant↔currency edge names", () => {
    expect(DRIZZLE_RELATION_NAME.tenantToCurrencyBase).toBe("tenant_base_currency")
    expect(DRIZZLE_RELATION_NAME.tenantToCurrencyReporting).toBe(
      "tenant_reporting_currency"
    )
  })

  it("has exactly two entries (base + reporting)", () => {
    expect(Object.keys(DRIZZLE_RELATION_NAME)).toHaveLength(2)
  })

  it("values are unique", () => {
    const v = Object.values(DRIZZLE_RELATION_NAME)
    expect(new Set(v).size).toBe(v.length)
  })

  it("type DrizzleDisambiguatedRelationName accepts both literals", () => {
    const a: DrizzleDisambiguatedRelationName =
      DRIZZLE_RELATION_NAME.tenantToCurrencyBase
    const b: DrizzleDisambiguatedRelationName =
      DRIZZLE_RELATION_NAME.tenantToCurrencyReporting
    expect(a).not.toBe(b)
  })
})
