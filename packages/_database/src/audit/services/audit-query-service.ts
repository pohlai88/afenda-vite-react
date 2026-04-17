import { and, desc, eq, gte, lte } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import {
  parseAuditQueryInput,
  type AuditQueryInput,
} from "../contracts/audit-query-contract"
import {
  auditLogs,
  type AuditLog,
} from "../../schema/governance/audit-logs.schema"

export async function queryAuditLogs(
  database: DatabaseClient,
  input: AuditQueryInput
): Promise<AuditLog[]> {
  const query = parseAuditQueryInput(input)
  const filters = [eq(auditLogs.tenantId, query.tenantId)]

  if (query.subjectType) {
    filters.push(eq(auditLogs.subjectType, query.subjectType))
  }
  if (query.subjectId) {
    filters.push(eq(auditLogs.subjectId, query.subjectId))
  }
  if (query.actorUserId) {
    filters.push(eq(auditLogs.actorUserId, query.actorUserId))
  }
  if (query.action) {
    filters.push(eq(auditLogs.action, query.action))
  }
  if (query.outcome) {
    filters.push(eq(auditLogs.outcome, query.outcome))
  }
  if (query.requestId) {
    filters.push(eq(auditLogs.requestId, query.requestId))
  }
  if (query.traceId) {
    filters.push(eq(auditLogs.traceId, query.traceId))
  }
  if (query.correlationId) {
    filters.push(eq(auditLogs.correlationId, query.correlationId))
  }
  if (query.fromRecordedAt) {
    filters.push(gte(auditLogs.recordedAt, query.fromRecordedAt))
  }
  if (query.toRecordedAt) {
    filters.push(lte(auditLogs.recordedAt, query.toRecordedAt))
  }

  return database
    .select()
    .from(auditLogs)
    .where(and(...filters))
    .orderBy(desc(auditLogs.recordedAt))
    .limit(query.limit)
}
