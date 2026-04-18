/**
 * Browser-safe glossary / truth-governance Zod contracts (no Node built-ins).
 * Use for runtime validation of Studio API JSON in the Vite client.
 */
export {
  businessGlossaryBodySchema,
  businessGlossarySnapshotSchema,
} from "./business-glossary.schema"
export type {
  BusinessGlossaryEntry,
  BusinessGlossarySnapshot,
  BusinessGlossaryTechnical,
} from "./business-glossary.types"
export {
  truthGovernanceBodySchema,
  truthGovernanceSnapshotSchema,
} from "./truth-governance.schema"
export type { TruthGovernanceSnapshot } from "./truth-governance.schema"
export { studioSnapshotEnvelopeSchema } from "./studio-snapshot-metadata.schema"
export type { StudioSnapshotEnvelope } from "./studio-snapshot-metadata.schema"
export {
  studioEnumsResponseSchema,
  studioPgEnumRowSchema,
} from "./studio-enums.schema"
export type { StudioPgEnumRow } from "./studio-enums.schema"
