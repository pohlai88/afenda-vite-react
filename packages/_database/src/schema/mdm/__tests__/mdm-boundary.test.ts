/**
 * Vitest: `mdm-boundary.schema.ts` — Zod contracts (see module annotation envelope).
 */
import { describe, expect, it } from "vitest"

import {
  mdmItemInsertSchema,
  mdmLegalEntityInsertSchema,
  mdmPartyInsertSchema,
} from "../mdm-boundary.schema"

const tid = "018f1234-5678-7abc-8def-123456789abc"

describe("mdm-boundary.schema", () => {
  it("accepts a minimal legal entity row", () => {
    const row = {
      tenantId: tid,
      entityCode: "LE001",
      legalName: "Acme Ltd",
      entityType: "company" as const,
      countryCode: "MY",
      baseCurrencyCode: "MYR",
      status: "active" as const,
    }
    expect(mdmLegalEntityInsertSchema.safeParse(row).success).toBe(true)
  })

  it("accepts a minimal party row", () => {
    const row = {
      tenantId: tid,
      partyCode: "P-1",
      partyType: "organization" as const,
      displayName: "Vendor A",
      canonicalName: "vendor a",
      status: "active" as const,
      mdmStatus: "golden" as const,
    }
    expect(mdmPartyInsertSchema.safeParse(row).success).toBe(true)
  })

  it("accepts a minimal item row", () => {
    const row = {
      tenantId: tid,
      itemCode: "SKU-1",
      itemName: "Widget",
      itemType: "inventory" as const,
      baseUomCode: "EA",
      status: "active" as const,
    }
    expect(mdmItemInsertSchema.safeParse(row).success).toBe(true)
  })
})
