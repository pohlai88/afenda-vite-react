import { describe, expect, it } from "vitest"

import { getBusinessGlossarySnapshot } from "../../studio/business-glossary"
import { STUDIO_PG_ENUM_ALLOWLIST } from "../../studio/pg-enum-allowlist"

describe("DB Studio glossary ↔ allowlisted Postgres enums", () => {
  it("has a postgres_enum glossary entry for every STUDIO_PG_ENUM_ALLOWLIST typname", () => {
    const doc = getBusinessGlossarySnapshot()
    const enumNames = new Set(
      doc.entries.flatMap((e) =>
        e.technical.artifact_kind === "postgres_enum"
          ? [e.technical.enum_name]
          : []
      )
    )
    for (const name of STUDIO_PG_ENUM_ALLOWLIST) {
      expect(enumNames.has(name)).toBe(true)
    }
  })
})
