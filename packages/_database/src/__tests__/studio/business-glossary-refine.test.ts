import { describe, expect, it } from "vitest"

import { businessGlossaryBodySchema } from "../../studio/business-glossary.schema"

describe("businessGlossaryBodySchema normalization", () => {
  it("rejects entries whose domain_module is not declared", () => {
    const result = businessGlossaryBodySchema.safeParse({
      schema_version: 1,
      document: "x",
      description: "",
      package: "@afenda/database",
      domain_modules: [{ id: "tenancy", label: "T", summary: "" }],
      entries: [
        {
          id: "bad",
          business_primary_term: "Bad",
          domain_module: "unknown_module",
          technical: {
            artifact_kind: "table",
            table: "t",
            drizzle_schema_file: "f",
          },
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it("rejects duplicate entry ids", () => {
    const result = businessGlossaryBodySchema.safeParse({
      schema_version: 1,
      document: "x",
      description: "",
      package: "@afenda/database",
      domain_modules: [{ id: "tenancy", label: "T", summary: "" }],
      entries: [
        {
          id: "dup",
          business_primary_term: "A",
          domain_module: "tenancy",
          technical: {
            artifact_kind: "table",
            table: "t",
            drizzle_schema_file: "f",
          },
        },
        {
          id: "dup",
          business_primary_term: "B",
          domain_module: "tenancy",
          technical: {
            artifact_kind: "table",
            table: "t2",
            drizzle_schema_file: "f2",
          },
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})
