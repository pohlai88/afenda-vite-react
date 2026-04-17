import type { AuditLog } from "../schema/audit-logs.schema"
import {
  auditAdminViewSchema,
  type AuditAdminView,
} from "../contracts/audit-admin-view-contract"

export function toAuditAdminView(row: AuditLog): AuditAdminView {
  return auditAdminViewSchema.parse({
    id: row.id,
    tenantId: row.tenantId,
    legalEntityId: row.legalEntityId ?? null,

    action: row.action,
    actionCategory: row.actionCategory ?? null,
    riskLevel: row.riskLevel ?? null,
    outcome: row.outcome,
    sourceChannel: row.sourceChannel,

    environment: row.environment ?? null,
    ipAddress: row.ipAddress ?? null,
    userAgent: row.userAgent ?? null,

    occurredAt: row.occurredAt,
    recordedAt: row.recordedAt,
    effectiveAt: row.effectiveAt ?? null,

    retentionClass: row.retentionClass ?? null,
    legalHold: row.legalHold,

    identity: {
      actorType: row.actorType,
      actorUserId: row.actorUserId ?? null,
      actorDisplay: row.actorDisplay ?? null,
      actingAsUserId: row.actingAsUserId ?? null,
    },

    subject: {
      subjectType: row.subjectType,
      subjectId: row.subjectId ?? null,
      aggregateType: row.aggregateType ?? null,
      aggregateId: row.aggregateId ?? null,
      documentType: row.documentType ?? null,
      documentId: row.documentId ?? null,
    },

    correlation: {
      parentAuditId: row.parentAuditId ?? null,
      requestId: row.requestId ?? null,
      traceId: row.traceId ?? null,
      correlationId: row.correlationId ?? null,
      causationId: row.causationId ?? null,
      commandId: row.commandId ?? null,
      sessionId: row.sessionId ?? null,
      jobId: row.jobId ?? null,
      batchId: row.batchId ?? null,
      idempotencyKey: row.idempotencyKey ?? null,
    },

    evidence: {
      changes: row.changes ?? null,
      metadata: row.metadata ?? null,
      doctrineRef: row.doctrineRef ?? null,
      invariantRef: row.invariantRef ?? null,
      resolutionRef: row.resolutionRef ?? null,
      reasonCode: row.reasonCode ?? null,
      reasonText: row.reasonText ?? null,
      errorCode: row.errorCode ?? null,
    },
  })
}
