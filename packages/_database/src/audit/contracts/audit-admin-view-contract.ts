import { z } from "zod/v4"

export const auditAdminIdentitySchema = z
  .object({
    actorType: z.string(),
    actorUserId: z.string().uuid().nullable().optional(),
    actorDisplay: z.string().nullable().optional(),
    actingAsUserId: z.string().uuid().nullable().optional(),
  })
  .strict()

export const auditAdminSubjectSchema = z
  .object({
    subjectType: z.string(),
    subjectId: z.string().nullable().optional(),
    aggregateType: z.string().nullable().optional(),
    aggregateId: z.string().nullable().optional(),
    documentType: z.string().nullable().optional(),
    documentId: z.string().nullable().optional(),
  })
  .strict()

export const auditAdminCorrelationSchema = z
  .object({
    parentAuditId: z.string().uuid().nullable().optional(),
    requestId: z.string().nullable().optional(),
    traceId: z.string().nullable().optional(),
    correlationId: z.string().nullable().optional(),
    causationId: z.string().nullable().optional(),
    commandId: z.string().nullable().optional(),
    sessionId: z.string().nullable().optional(),
    jobId: z.string().nullable().optional(),
    batchId: z.string().nullable().optional(),
    idempotencyKey: z.string().nullable().optional(),
  })
  .strict()

export const auditAdminEvidenceSchema = z
  .object({
    changes: z.record(z.string(), z.unknown()).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    doctrineRef: z.string().nullable().optional(),
    invariantRef: z.string().nullable().optional(),
    resolutionRef: z.string().nullable().optional(),
    reasonCode: z.string().nullable().optional(),
    reasonText: z.string().nullable().optional(),
    errorCode: z.string().nullable().optional(),
  })
  .strict()

export const auditAdminViewSchema = z
  .object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    legalEntityId: z.string().uuid().nullable().optional(),

    action: z.string(),
    actionCategory: z.string().nullable().optional(),
    riskLevel: z.string().nullable().optional(),
    outcome: z.string(),
    sourceChannel: z.string(),

    environment: z.string().nullable().optional(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),

    occurredAt: z.date(),
    recordedAt: z.date(),
    effectiveAt: z.date().nullable().optional(),

    retentionClass: z.string().nullable().optional(),
    legalHold: z.boolean(),

    identity: auditAdminIdentitySchema,
    subject: auditAdminSubjectSchema,
    correlation: auditAdminCorrelationSchema,
    evidence: auditAdminEvidenceSchema,
  })
  .strict()

export type AuditAdminView = z.infer<typeof auditAdminViewSchema>
