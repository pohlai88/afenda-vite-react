import { z } from "zod/v4"

export const auditQueryInputSchema = z
  .object({
    tenantId: z.string().uuid(),
    subjectType: z.string().min(1).optional(),
    subjectId: z.string().min(1).optional(),
    actorUserId: z.string().uuid().optional(),
    action: z.string().min(1).optional(),
    outcome: z.enum(["success", "rejected", "failed", "partial"]).optional(),
    requestId: z.string().min(1).optional(),
    traceId: z.string().min(1).optional(),
    correlationId: z.string().min(1).optional(),
    fromRecordedAt: z.date().optional(),
    toRecordedAt: z.date().optional(),
    limit: z.number().int().positive().max(500).default(100),
  })
  .strict()

export type AuditQueryInput = z.infer<typeof auditQueryInputSchema>

export function parseAuditQueryInput(value: unknown): AuditQueryInput {
  return auditQueryInputSchema.parse(value)
}
