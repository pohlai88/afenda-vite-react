import { z } from "zod"

import { studioSnapshotEnvelopeSchema } from "./studio-snapshot-metadata.schema"

export const businessGlossaryDomainModuleSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  summary: z.string(),
})

export const businessGlossaryTechnicalSchema = z.discriminatedUnion(
  "artifact_kind",
  [
    z.object({
      artifact_kind: z.literal("table"),
      table: z.string().min(1),
      drizzle_schema_file: z.string().min(1),
    }),
    z.object({
      artifact_kind: z.literal("postgres_enum"),
      enum_name: z.string().min(1),
      drizzle_schema_file: z.string().min(1),
    }),
  ]
)

export const businessGlossaryEntrySchema = z.object({
  id: z.string().min(1),
  business_primary_term: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  domain_module: z.string().min(1),
  related_doc_anchor: z.string().optional(),
  technical: businessGlossaryTechnicalSchema,
  notes: z.string().optional(),
})

/** Content aligned with `business-technical-glossary.yaml` (before envelope fields). */
export const businessGlossaryBodySchema = z
  .object({
    schema_version: z.number().int().positive(),
    document: z.string().min(1),
    description: z.string(),
    package: z.string().min(1),
    domain_modules: z.array(businessGlossaryDomainModuleSchema),
    entries: z.array(businessGlossaryEntrySchema),
  })
  .superRefine((data, ctx) => {
    const moduleIds = data.domain_modules.map((m) => m.id)
    if (new Set(moduleIds).size !== moduleIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "domain_modules: duplicate id",
        path: ["domain_modules"],
      })
    }
    const allowed = new Set(moduleIds)
    const entryIds = data.entries.map((e) => e.id)
    if (new Set(entryIds).size !== entryIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "entries: duplicate id",
        path: ["entries"],
      })
    }
    for (let i = 0; i < data.entries.length; i++) {
      const dm = data.entries[i].domain_module
      if (!allowed.has(dm)) {
        ctx.addIssue({
          code: "custom",
          message: `entries[${i}].domain_module "${dm}" is not listed in domain_modules`,
          path: ["entries", i, "domain_module"],
        })
      }
    }
  })

export type BusinessGlossaryBody = z.infer<typeof businessGlossaryBodySchema>

/**
 * Runtime contract: YAML → sync script → JSON file → API → SPA.
 * Do not collapse truth-governance semantics into this document.
 */
export const businessGlossarySnapshotSchema = studioSnapshotEnvelopeSchema
  .extend({
    document_kind: z.literal("business_glossary_snapshot"),
  })
  .merge(businessGlossaryBodySchema)

export type BusinessGlossarySnapshot = z.infer<typeof businessGlossarySnapshotSchema>
