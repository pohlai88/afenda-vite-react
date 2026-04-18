/**
 * Vitest: `finance-boundary.schema.ts` — Zod insert/enum contracts (see module annotation envelope).
 */
import { describe, expect, it } from "vitest"

import {
  financeAccountInsertSchema,
  financeFiscalPeriodInsertSchema,
} from "../finance-boundary.schema"

describe("finance-boundary.schemas", () => {
  it("accepts a valid fiscal period row", () => {
    const row = {
      tenantId: "018f1234-5678-7abc-8def-123456789abc",
      fiscalCalendarId: "028f1234-5678-7abc-8def-123456789abc",
      periodCode: "2026-01",
      periodName: "January 2026",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      periodStatus: "open" as const,
      yearNumber: 2026,
      periodNumber: 1,
    }
    expect(financeFiscalPeriodInsertSchema.safeParse(row).success).toBe(true)
  })

  it("rejects end before start", () => {
    const row = {
      tenantId: "018f1234-5678-7abc-8def-123456789abc",
      fiscalCalendarId: "028f1234-5678-7abc-8def-123456789abc",
      periodCode: "bad",
      periodName: "Bad",
      startDate: "2026-02-01",
      endDate: "2026-01-01",
      periodStatus: "open" as const,
      yearNumber: 2026,
      periodNumber: 1,
    }
    const r = financeFiscalPeriodInsertSchema.safeParse(row)
    expect(r.success).toBe(false)
  })

  it("accepts a minimal account row", () => {
    const row = {
      tenantId: "018f1234-5678-7abc-8def-123456789abc",
      coaSetId: "028f1234-5678-7abc-8def-123456789abc",
      accountCode: "4000",
      accountName: "Sales",
      accountType: "revenue" as const,
      postingType: "posting" as const,
      normalBalance: "credit" as const,
    }
    expect(financeAccountInsertSchema.safeParse(row).success).toBe(true)
  })
})
