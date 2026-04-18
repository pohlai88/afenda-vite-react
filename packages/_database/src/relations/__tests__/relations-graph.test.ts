/**
 * Vitest: every `relations()` graph exported from `relations.schema.ts` loads and is a non-null object.
 * Complements {@link ./relations-inventory.ts}.
 */
import { describe, expect, it } from "vitest"

import * as RelationsBarrel from "../relations.schema"
import { DRIZZLE_RELATION_NAME } from "../relation-names"
import {
  EXPECTED_RELATIONS_GRAPH_COUNT,
  RELATIONS_FEATURE_COUNT,
  RELATIONS_GRAPH_EXPORT_NAMES,
} from "./relations-inventory"

describe("relations barrel (F2–F5)", () => {
  it(`exports ${EXPECTED_RELATIONS_GRAPH_COUNT} relation graphs`, () => {
    expect(RELATIONS_GRAPH_EXPORT_NAMES.length).toBe(
      EXPECTED_RELATIONS_GRAPH_COUNT
    )
  })

  it("documents five feature areas", () => {
    expect(RELATIONS_FEATURE_COUNT).toBe(5)
  })

  it.each(RELATIONS_GRAPH_EXPORT_NAMES)(
    "%s is defined and is a relations graph object",
    (name) => {
      const graph = RelationsBarrel[name as keyof typeof RelationsBarrel]
      expect(graph, `${name} missing on barrel`).toBeDefined()
      expect(graph).not.toBeNull()
      expect(typeof graph).toBe("object")
    }
  )

  it("re-exports DRIZZLE_RELATION_NAME from the barrel", () => {
    expect(RelationsBarrel.DRIZZLE_RELATION_NAME).toBe(DRIZZLE_RELATION_NAME)
  })
})
