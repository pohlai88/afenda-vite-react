import {
  appCandidateArraySchema,
  appCandidateSchema,
  type AppCandidate,
} from "../schema/candidate.schema.js"

export const syncPackCandidateContractId = "FSDK-SYNC-CANDIDATE-001" as const

export const syncPackCandidateSchema = appCandidateSchema
export const syncPackCandidateArrayContractSchema = appCandidateArraySchema

export type SyncPackCandidate = AppCandidate

export function parseSyncPackCandidate(input: unknown): SyncPackCandidate {
  return syncPackCandidateSchema.parse(input)
}

export function parseSyncPackCandidates(
  input: unknown
): readonly SyncPackCandidate[] {
  return syncPackCandidateArrayContractSchema.parse(input)
}
