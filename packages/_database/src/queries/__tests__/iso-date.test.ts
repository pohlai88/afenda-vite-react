/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/__tests__/iso-date.test.ts` — Vitest for `helpers/iso-date`.
 */
import { describe, expect, it } from "vitest"

import {
  assertIsoDateOnly,
  isIsoDateOnly,
  todayIsoDateUtc,
} from "../helpers/iso-date"

describe("iso-date", () => {
  it("todayIsoDateUtc returns YYYY-MM-DD", () => {
    expect(todayIsoDateUtc()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("assertIsoDateOnly accepts valid dates", () => {
    expect(() => assertIsoDateOnly("2026-04-18")).not.toThrow()
  })

  it("assertIsoDateOnly rejects invalid input", () => {
    expect(() => assertIsoDateOnly("04-18-2026")).toThrow(TypeError)
    expect(() => assertIsoDateOnly("2026-4-18")).toThrow(TypeError)
    expect(() => assertIsoDateOnly("")).toThrow(TypeError)
  })

  it("assertIsoDateOnly uses custom param name in TypeError", () => {
    expect(() => assertIsoDateOnly("bad", "effectiveOn")).toThrow(
      /effectiveOn must be an ISO 8601/
    )
  })

  it("isIsoDateOnly is a non-throwing guard", () => {
    expect(isIsoDateOnly("2026-01-01")).toBe(true)
    expect(isIsoDateOnly("bad")).toBe(false)
  })
})
