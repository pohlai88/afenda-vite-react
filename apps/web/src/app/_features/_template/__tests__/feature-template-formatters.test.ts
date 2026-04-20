import { describe, expect, it } from "vitest"

import {
  formatFeatureTemplateDateTime,
  formatFeatureTemplateLastSync,
  formatFeatureTemplateTime,
  normalizeFeatureTemplateText,
  parseFeatureTemplateDate,
  resolveFeatureTemplateDateTime,
} from "../utils/feature-template-formatters"

describe("featureTemplateFormatters", () => {
  it("normalizes optional text safely", () => {
    expect(normalizeFeatureTemplateText("  Acme Treasury Ltd  ")).toBe(
      "Acme Treasury Ltd"
    )
    expect(normalizeFeatureTemplateText("   ")).toBeNull()
    expect(normalizeFeatureTemplateText(undefined)).toBeNull()
  })

  it("parses valid feature dates and rejects invalid ones", () => {
    expect(parseFeatureTemplateDate("2026-04-20T09:30:00.000Z")).toBeInstanceOf(
      Date
    )
    expect(parseFeatureTemplateDate("not-a-date")).toBeNull()
  })

  it("formats time labels with explicit overrides and invalid fallbacks", () => {
    expect(
      formatFeatureTemplateTime("2026-04-20T09:30:00.000Z", "09:30 ICT")
    ).toBe("09:30 ICT")
    expect(formatFeatureTemplateTime("not-a-date")).toBe("Unknown time")
  })

  it("formats date-time labels with explicit overrides and invalid fallbacks", () => {
    expect(
      formatFeatureTemplateDateTime("2026-04-20T09:30:00.000Z", "Apr 20 09:30")
    ).toBe("Apr 20 09:30")
    expect(formatFeatureTemplateDateTime("not-a-date")).toBe("Unknown time")
  })

  it("resolves ISO datetime values safely", () => {
    expect(resolveFeatureTemplateDateTime("2026-04-20T09:30:00.000Z")).toBe(
      "2026-04-20T09:30:00.000Z"
    )
    expect(resolveFeatureTemplateDateTime("not-a-date")).toBeUndefined()
  })

  it("formats last-sync copy with and without records", () => {
    expect(formatFeatureTemplateLastSync([])).toBe("No records observed")
    expect(
      formatFeatureTemplateLastSync([
        {
          id: "REC-001",
          title: "Queue item",
          description: "Latest record",
          status: "attention",
          owner: "Ops",
          updatedAt: "bad-date",
        },
      ])
    ).toBe("Last sync Unknown time")
  })
})
