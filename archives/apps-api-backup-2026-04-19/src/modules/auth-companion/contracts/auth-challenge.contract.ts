import { z } from "zod"

export const AuthChallengeMethodSchema = z.enum([
  "passkey",
  "totp",
  "email_otp",
])

export const AuthChallengeTicketSchema = z.object({
  challengeId: z.string().min(1),
  method: AuthChallengeMethodSchema,
})

export const AuthChallengePromptSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  expiresAtIso: z.string().datetime().optional(),
  attemptsRemaining: z.number().int().min(0).optional(),
})

export const StartAuthChallengeBodySchema = z.object({
  email: z.string().email(),
  method: AuthChallengeMethodSchema,
})

export const StartAuthChallengeResponseSchema = z.object({
  ticket: AuthChallengeTicketSchema,
  prompt: AuthChallengePromptSchema,
})

/** WebAuthn assertion payload (client-serialized credential). */
export const PasskeyCredentialProofSchema = z.object({
  id: z.string().min(1),
  response: z.object({
    clientDataJSON: z.string().min(1),
    authenticatorData: z.string().min(1),
    signature: z.string().min(1),
    userHandle: z.union([z.string(), z.null()]).optional(),
  }),
})

export const VerifyAuthChallengeBodySchema = z.discriminatedUnion("method", [
  z.object({
    challengeId: z.string().min(1),
    method: z.literal("passkey"),
    credential: PasskeyCredentialProofSchema,
  }),
  z.object({
    challengeId: z.string().min(1),
    method: z.literal("totp"),
    proof: z.object({
      code: z.string().regex(/^[0-9]{6}$/),
    }),
  }),
  z.object({
    challengeId: z.string().min(1),
    method: z.literal("email_otp"),
    proof: z.object({
      code: z.string().regex(/^[0-9]{6}$/),
    }),
  }),
])

export const VerifyAuthChallengeResponseSchema = z.object({
  verified: z.boolean(),
  receipt: z.array(z.string().min(1)),
})

export type AuthChallengeMethod = z.infer<typeof AuthChallengeMethodSchema>
export type AuthChallengeTicket = z.infer<typeof AuthChallengeTicketSchema>
export type AuthChallengePrompt = z.infer<typeof AuthChallengePromptSchema>
export type StartAuthChallengeBody = z.infer<
  typeof StartAuthChallengeBodySchema
>
export type StartAuthChallengeResponse = z.infer<
  typeof StartAuthChallengeResponseSchema
>
export type VerifyAuthChallengeBody = z.infer<
  typeof VerifyAuthChallengeBodySchema
>
export type VerifyAuthChallengeResponse = z.infer<
  typeof VerifyAuthChallengeResponseSchema
>
export type PasskeyCredentialProof = z.infer<
  typeof PasskeyCredentialProofSchema
>
