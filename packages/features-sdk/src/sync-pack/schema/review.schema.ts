import { z } from "zod"

export const buildModes = ["adopt", "adapt", "inspire", "avoid"] as const
export const candidateStatuses = [
  "candidate",
  "approved",
  "rejected",
  "implemented",
] as const
export const dataSensitivities = ["low", "medium", "high"] as const

export const buildModeSchema = z.enum(buildModes)
export const candidateStatusSchema = z.enum(candidateStatuses)
export const dataSensitivitySchema = z.enum(dataSensitivities)

export type BuildMode = (typeof buildModes)[number]
export type CandidateStatus = (typeof candidateStatuses)[number]
export type DataSensitivity = (typeof dataSensitivities)[number]
