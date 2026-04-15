import { z } from "zod"

export const AuthTrustLevelSchema = z.enum([
  "low",
  "medium",
  "high",
  "verified",
])

export const AuthRiskReasonSeveritySchema = z.enum([
  "info",
  "warning",
  "danger",
])

export const AuthRiskReasonSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  severity: AuthRiskReasonSeveritySchema,
})

export const AuthRecommendedMethodSchema = z.enum([
  "passkey",
  "password",
  "social",
])

export const AuthIntelligenceSnapshotSchema = z.object({
  trustLevel: AuthTrustLevelSchema,
  score: z.number().int().min(0).max(100),
  deviceLabel: z.string().min(1),
  regionLabel: z.string().min(1),
  lastSeenLabel: z.string().min(1),
  reasons: z.array(AuthRiskReasonSchema),
  passkeyAvailable: z.boolean(),
  recommendedMethod: AuthRecommendedMethodSchema,
})

export type AuthIntelligenceSnapshot = z.infer<
  typeof AuthIntelligenceSnapshotSchema
>
