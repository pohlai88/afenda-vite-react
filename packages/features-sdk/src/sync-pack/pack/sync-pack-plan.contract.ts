import type { AppCandidate } from "../schema/candidate.schema.js"
import {
  getRequiredPackFileNames,
  type PackFileName,
} from "../schema/pack-template.schema.js"

import type { SyncPackImplementationSurface } from "../report/sync-pack-ranking-report.contract.js"

export const syncPackPlanContractId = "FSDK-SYNC-PACK-001" as const

export interface SyncPackGeneratedPlanHandoff {
  readonly contractId: typeof syncPackPlanContractId
  readonly candidateId: string
  readonly planningPackDirectory: string
  readonly requiredFiles: readonly PackFileName[]
  readonly likelyImplementationSurfaces: readonly SyncPackImplementationSurface[]
  readonly requiredValidation: readonly string[]
  readonly recommendedNextActions: readonly string[]
}

export function createSyncPackGeneratedPlanHandoff(options: {
  readonly candidate: AppCandidate
  readonly planningPackDirectory: string
  readonly likelyImplementationSurfaces: readonly SyncPackImplementationSurface[]
  readonly requiredValidation: readonly string[]
}): SyncPackGeneratedPlanHandoff {
  return {
    contractId: syncPackPlanContractId,
    candidateId: options.candidate.id,
    planningPackDirectory: options.planningPackDirectory,
    requiredFiles: getRequiredPackFileNames(),
    likelyImplementationSurfaces: options.likelyImplementationSurfaces,
    requiredValidation: options.requiredValidation,
    recommendedNextActions: [
      "Review the generated implementation pack with the owning product and platform teams.",
      `Run pnpm run feature-sync:scaffold -- --app-id ${options.candidate.id} --category ${options.candidate.internalCategory}`,
      "Hand off implementation to apps/web and apps/api owners after contract review.",
    ],
  }
}
