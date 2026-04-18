import { describe, expect, it } from "vitest"

import { buildDomainModuleMatrix } from "../../studio/business-glossary"
import { businessGlossarySnapshotSchema } from "../../studio/business-glossary.schema"

describe("buildDomainModuleMatrix", () => {
  it("counts entries per domain_module", () => {
    const doc = businessGlossarySnapshotSchema.parse({
      document_kind: "business_glossary_snapshot",
      generated_at: "2026-01-01T00:00:00.000Z",
      source_commit: null,
      source_content_sha256: "a".repeat(64),
      schema_version: 1,
      document: "test",
      description: "",
      package: "@afenda/database",
      domain_modules: [
        { id: "tenancy", label: "Tenancy", summary: "" },
        { id: "identity", label: "Identity", summary: "" },
      ],
      entries: [
        {
          id: "a",
          business_primary_term: "A",
          domain_module: "tenancy",
          technical: {
            artifact_kind: "table",
            table: "t",
            drizzle_schema_file: "f",
          },
        },
        {
          id: "b",
          business_primary_term: "B",
          domain_module: "tenancy",
          technical: {
            artifact_kind: "table",
            table: "t2",
            drizzle_schema_file: "f2",
          },
        },
        {
          id: "c",
          business_primary_term: "C",
          domain_module: "identity",
          technical: {
            artifact_kind: "table",
            table: "u",
            drizzle_schema_file: "f3",
          },
        },
      ],
    })

    expect(buildDomainModuleMatrix(doc)).toEqual({
      tenancy: 2,
      identity: 1,
    })
  })
})
