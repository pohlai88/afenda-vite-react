import { z } from "zod/v4"

export const auditFieldDeltaSchema = z.object({
  field: z.string().min(1),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
})

export const auditTransitionSchema = z.object({
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
})

export const auditChangesSchema = z
  .object({
    before: z.record(z.string(), z.unknown()).optional(),
    after: z.record(z.string(), z.unknown()).optional(),
    deltas: z.array(auditFieldDeltaSchema).optional(),
    transition: auditTransitionSchema.optional(),
  })
  .strict()

export const auditMetadataSchema = z
  .object({
    route: z.string().min(1).optional(),
    feature: z.string().min(1).optional(),
    module: z.string().min(1).optional(),
    serviceName: z.string().min(1).optional(),
    serviceVersion: z.string().min(1).optional(),
    clientVersion: z.string().min(1).optional(),
    flags: z.record(z.string(), z.unknown()).optional(),
    extra: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()

export type AuditChanges = z.infer<typeof auditChangesSchema>
export type AuditMetadata = z.infer<typeof auditMetadataSchema>

export function parseAuditChanges(value: unknown): AuditChanges | undefined {
  if (value == null) return undefined
  return auditChangesSchema.parse(value)
}

export function parseAuditMetadata(value: unknown): AuditMetadata | undefined {
  if (value == null) return undefined
  return auditMetadataSchema.parse(value)
}
