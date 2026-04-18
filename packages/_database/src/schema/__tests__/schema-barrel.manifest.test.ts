/**
 * Vitest: `@afenda/database/schema` main barrel — required symbols must never disappear silently.
 */
import { describe, expect, it } from "vitest"

import * as SchemaBarrel from "../index"
import {
  REQUIRED_SCHEMA_BARREL_EXPORTS,
  SCHEMA_BARREL_DOMAIN_COUNT,
} from "./schema-inventory"

describe("schema/index barrel manifest", () => {
  it("documents seven star-export domains (finance … views)", () => {
    expect(SCHEMA_BARREL_DOMAIN_COUNT).toBe(7)
  })

  it.each(REQUIRED_SCHEMA_BARREL_EXPORTS)(
    "exports %s (required anchor)",
    (exportName) => {
      const v = SchemaBarrel[exportName as keyof typeof SchemaBarrel]
      expect(v, exportName).toBeDefined()
      expect(v, exportName).not.toBeNull()
    }
  )
})
