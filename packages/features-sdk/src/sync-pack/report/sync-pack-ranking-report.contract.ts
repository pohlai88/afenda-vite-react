import { z } from "zod"

import { appPrioritySchema } from "../schema/priority.schema.js"

export const syncPackRankingReportContractId = "FSDK-SYNC-REPORT-001" as const

export const syncPackRankingConfidenceSchema = z.enum(["low", "medium", "high"])
export const syncPackImplementationSurfaceSchema = z.enum([
  "apps/web",
  "apps/api",
])

export const syncPackRankingReportRowSchema = z.strictObject({
  candidateId: z.string().min(1),
  declaredPriority: appPrioritySchema,
  recommendedPriority: appPrioritySchema,
  score: z.number().int().nonnegative(),
  confidence: syncPackRankingConfidenceSchema,
  declaredPriorityMatchesRecommendation: z.boolean(),
  reasons: z.array(z.string().min(1)).min(1),
  assumptions: z.array(z.string().min(1)),
  likelyImplementationSurfaces: z
    .array(syncPackImplementationSurfaceSchema)
    .min(1),
  requiredValidation: z.array(z.string().min(1)).min(1),
})

export const syncPackRankingReportSchema = z.strictObject({
  contractId: z.literal(syncPackRankingReportContractId),
  selectedCandidateCount: z.number().int().nonnegative(),
  totalCandidateCount: z.number().int().nonnegative(),
  filters: z.array(z.string().min(1)),
  rows: z.array(syncPackRankingReportRowSchema),
})

export type SyncPackRankingConfidence = z.infer<
  typeof syncPackRankingConfidenceSchema
>
export type SyncPackImplementationSurface = z.infer<
  typeof syncPackImplementationSurfaceSchema
>
export type SyncPackRankingReportRow = z.infer<
  typeof syncPackRankingReportRowSchema
>
export type SyncPackRankingReport = z.infer<typeof syncPackRankingReportSchema>
