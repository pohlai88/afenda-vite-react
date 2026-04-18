/**
 * Vitest: `ref-boundary.schema.ts` — Zod contracts (see module annotation envelope).
 */
import { describe, expect, it } from "vitest"

import {
  refCountryCodeSchema,
  refCountryInsertSchema,
  refCurrencyInsertSchema,
  refLocaleInsertSchema,
  refTimezoneInsertSchema,
  refUomInsertSchema,
} from "../ref-boundary.schema"

describe("ref-boundary.schema", () => {
  it("accepts ISO country and currency codes", () => {
    expect(refCountryCodeSchema.safeParse("MY").success).toBe(true)
    expect(refCountryCodeSchema.safeParse("my").success).toBe(false)

    expect(
      refCurrencyInsertSchema.safeParse({
        code: "MYR",
        name: "Malaysian Ringgit",
      }).success
    ).toBe(true)
  })

  it("accepts seed rows for locales, timezones, uoms", () => {
    expect(
      refLocaleInsertSchema.safeParse({
        code: "en-MY",
        name: "English (Malaysia)",
      }).success
    ).toBe(true)

    expect(
      refTimezoneInsertSchema.safeParse({
        name: "Asia/Kuala_Lumpur",
      }).success
    ).toBe(true)

    expect(
      refUomInsertSchema.safeParse({
        code: "EA",
      }).success
    ).toBe(true)

    expect(refCountryInsertSchema.safeParse({ code: "SG" }).success).toBe(true)
  })

  it("rejects invalid currency numeric codes at the boundary", () => {
    expect(
      refCurrencyInsertSchema.safeParse({
        code: "USD",
        numericCode: "84",
        name: "US Dollar",
      }).success
    ).toBe(false)
  })
})
