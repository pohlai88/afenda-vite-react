import { z } from "zod"

export const AuthSessionRiskSchema = z.enum(["low", "medium", "high"])

export const AuthSessionItemSchema = z.object({
  id: z.string().min(1),
  device: z.string().min(1),
  location: z.string().min(1),
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
  isCurrent: z.boolean(),
  risk: AuthSessionRiskSchema,
})

export const AuthSessionsPayloadSchema = z.object({
  sessions: z.array(AuthSessionItemSchema),
  factors: z.object({
    password: z.boolean(),
    social: z.boolean(),
    passkey: z.boolean(),
    mfa: z.boolean(),
  }),
  recentEvents: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      timeLabel: z.string().min(1),
    })
  ),
})

export const RevokeAuthSessionBodySchema = z.object({
  sessionId: z.string().min(1),
})

export type AuthSessionsPayload = z.infer<typeof AuthSessionsPayloadSchema>
export type RevokeAuthSessionBody = z.infer<typeof RevokeAuthSessionBodySchema>
