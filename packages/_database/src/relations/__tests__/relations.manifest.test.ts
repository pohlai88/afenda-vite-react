/**
 * Vitest: `relations.schema.ts` barrel must stay in lockstep with {@link ./relations-inventory.ts}.
 * Any new `export const *Relations` or stray runtime export fails this suite.
 */
import { describe, expect, it } from "vitest"

import * as RelationsBarrel from "../relations.schema"
import { RELATIONS_GRAPH_EXPORT_NAMES } from "./relations-inventory"

describe("relations.schema barrel manifest", () => {
  it("runtime export keys equal inventory + DRIZZLE_RELATION_NAME only", () => {
    const actual = new Set(Object.keys(RelationsBarrel))
    const expected = new Set<string>([
      ...RELATIONS_GRAPH_EXPORT_NAMES,
      "DRIZZLE_RELATION_NAME",
    ])
    expect(actual).toEqual(expected)
  })
})
