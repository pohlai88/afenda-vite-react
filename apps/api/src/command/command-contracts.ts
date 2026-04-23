import { z } from "zod"

export const opsEventClaimPayloadSchema = z.object({
  eventId: z.string().trim().min(1),
})

export const opsEventAdvancePayloadSchema = z.object({
  eventId: z.string().trim().min(1),
})

export const commandExecutionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ops.event.claim"),
    payload: opsEventClaimPayloadSchema,
  }),
  z.object({
    type: z.literal("ops.event.advance"),
    payload: opsEventAdvancePayloadSchema,
  }),
])

export type CommandExecutionRequest = z.infer<typeof commandExecutionSchema>
export type OpsEventClaimPayload = z.infer<typeof opsEventClaimPayloadSchema>
export type OpsEventAdvancePayload = z.infer<
  typeof opsEventAdvancePayloadSchema
>
