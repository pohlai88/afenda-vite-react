import { date, pgTable } from "drizzle-orm/pg-core"
import { describe, expect, it } from "vitest"

import { effectiveOnAsOfDatePredicate } from "../query-primitives/effective-date-predicate"

const effTable = pgTable("eff_test", {
  effective_from: date("effective_from").notNull(),
  effective_to: date("effective_to"),
})

describe("effectiveOnAsOfDatePredicate", () => {
  it("returns a Drizzle SQL fragment for as-of semantics", () => {
    const pred = effectiveOnAsOfDatePredicate(
      effTable.effective_from,
      effTable.effective_to,
      "2026-04-18"
    )
    expect(pred).toBeDefined()
  })
})
