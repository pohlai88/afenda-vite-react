import { z } from "zod"

import { studioSnapshotEnvelopeSchema } from "./studio-snapshot-metadata.schema"

/** Declarative truth / scope / time semantics — separate from the business↔technical glossary. */
export const truthGovernanceBodySchema = z
  .object({
    schema_version: z.number().int().positive(),
    document: z.string().min(1),
    description: z.string(),
    package: z.string().min(1),
    truth_classes: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string(),
        summary: z.string().optional(),
      })
    ),
    scope_models: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string(),
        summary: z.string().optional(),
      })
    ),
    time_models: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string(),
        summary: z.string().optional(),
      })
    ),
    /** Bindings from technical artifacts to truth/scope/time registries. */
    artifact_bindings: z.array(
      z.object({
        id: z.string().min(1),
        artifact_ref: z.string().min(1),
        truth_class_id: z.string().optional(),
        scope_model_id: z.string().optional(),
        time_model_id: z.string().optional(),
        notes: z.string().optional(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    const assertUniqueIds = (
      rows: readonly { id: string }[],
      pathKey: "truth_classes" | "scope_models" | "time_models" | "artifact_bindings"
    ) => {
      const ids = rows.map((r) => r.id)
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({
          code: "custom",
          message: `${pathKey}: duplicate id`,
          path: [pathKey],
        })
      }
    }
    assertUniqueIds(data.truth_classes, "truth_classes")
    assertUniqueIds(data.scope_models, "scope_models")
    assertUniqueIds(data.time_models, "time_models")
    assertUniqueIds(data.artifact_bindings, "artifact_bindings")

    const tc = new Set(data.truth_classes.map((t) => t.id))
    const sm = new Set(data.scope_models.map((t) => t.id))
    const tm = new Set(data.time_models.map((t) => t.id))
    for (let i = 0; i < data.artifact_bindings.length; i++) {
      const b = data.artifact_bindings[i]
      if (b.truth_class_id && !tc.has(b.truth_class_id)) {
        ctx.addIssue({
          code: "custom",
          message: `artifact_bindings[${i}].truth_class_id not found in truth_classes`,
          path: ["artifact_bindings", i, "truth_class_id"],
        })
      }
      if (b.scope_model_id && !sm.has(b.scope_model_id)) {
        ctx.addIssue({
          code: "custom",
          message: `artifact_bindings[${i}].scope_model_id not found in scope_models`,
          path: ["artifact_bindings", i, "scope_model_id"],
        })
      }
      if (b.time_model_id && !tm.has(b.time_model_id)) {
        ctx.addIssue({
          code: "custom",
          message: `artifact_bindings[${i}].time_model_id not found in time_models`,
          path: ["artifact_bindings", i, "time_model_id"],
        })
      }
    }
  })

export type TruthGovernanceBody = z.infer<typeof truthGovernanceBodySchema>

export const truthGovernanceSnapshotSchema = studioSnapshotEnvelopeSchema
  .extend({
    document_kind: z.literal("database_truth_governance_snapshot"),
  })
  .merge(truthGovernanceBodySchema)

export type TruthGovernanceSnapshot = z.infer<typeof truthGovernanceSnapshotSchema>
