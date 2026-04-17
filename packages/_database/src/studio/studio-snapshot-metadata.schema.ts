import { z } from "zod"

/** Shared envelope for JSON artifacts produced from YAML (glossary vs truth governance). */
export const studioSnapshotEnvelopeSchema = z.object({
  document_kind: z.enum([
    "business_glossary_snapshot",
    "database_truth_governance_snapshot",
  ]),
  /** ISO 8601 timestamp when the snapshot was generated */
  generated_at: z.string().min(20),
  /** Short git SHA when available (CI/local); null when not a git checkout */
  source_commit: z.string().min(4).nullable(),
  /** SHA-256 (hex) of the source YAML bytes for reproducibility without git */
  source_content_sha256: z.string().regex(/^[a-f0-9]{64}$/u),
})

export type StudioSnapshotEnvelope = z.infer<typeof studioSnapshotEnvelopeSchema>
