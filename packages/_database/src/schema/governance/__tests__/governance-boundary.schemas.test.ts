/**
 * Vitest: `governance-boundary.schema.ts` — Zod insert contracts for `governance.data_sources`.
 */
import { describe, expect, it } from "vitest"

import { governanceDataSourceInsertSchema } from "../governance-boundary.schema"

describe("governance-boundary.schemas (data sources)", () => {
  it("accepts a data source insert", () => {
    const row = {
      sourceCode: "SAP",
      sourceName: "SAP ECC",
      sourceType: "legacy_erp" as const,
    }
    expect(governanceDataSourceInsertSchema.safeParse(row).success).toBe(true)
  })

  it("rejects non-positive priority when provided", () => {
    const row = {
      sourceCode: "X",
      sourceName: "Y",
      sourceType: "api" as const,
      priorityRank: 0,
    }
    expect(governanceDataSourceInsertSchema.safeParse(row).success).toBe(false)
  })
})
