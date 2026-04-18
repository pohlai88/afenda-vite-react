/**
 * Barrel surface check for `src/queries` — pairs with {@link ./queries-inventory.ts}.
 */
import { describe, expect, it } from "vitest"

import * as Queries from "../index"
import {
  EXPECTED_QUERIES_RUNTIME_FUNCTION_COUNT,
  QUERIES_FEATURE_COUNT,
  QUERIES_RUNTIME_FUNCTION_NAMES,
} from "./queries-inventory"

describe("queries inventory", () => {
  it(`exports ${EXPECTED_QUERIES_RUNTIME_FUNCTION_COUNT} runtime functions`, () => {
    expect(QUERIES_RUNTIME_FUNCTION_NAMES.length).toBe(8)
    for (const name of QUERIES_RUNTIME_FUNCTION_NAMES) {
      expect(
        typeof (Queries as Record<string, unknown>)[name],
        `${name} must be a function`
      ).toBe("function")
    }
  })

  it("documents nine feature areas (F1–F9)", () => {
    expect(QUERIES_FEATURE_COUNT).toBe(9)
  })
})
