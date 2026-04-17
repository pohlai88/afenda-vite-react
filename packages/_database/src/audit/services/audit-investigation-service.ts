import type { DatabaseClient } from "../../client"
import type { AuditLog } from "../schema/audit-logs.schema"
import { queryAuditLogs } from "./audit-query-service"

const DEFAULT_LIMIT = 100

export async function getSubjectAuditHistory(
  database: DatabaseClient,
  input: {
    tenantId: string
    subjectType: string
    subjectId: string
    limit?: number
  }
): Promise<AuditLog[]> {
  return queryAuditLogs(database, {
    tenantId: input.tenantId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    limit: input.limit ?? DEFAULT_LIMIT,
  })
}

export async function getRequestAuditHistory(
  database: DatabaseClient,
  input: {
    tenantId: string
    requestId: string
    limit?: number
  }
): Promise<AuditLog[]> {
  return queryAuditLogs(database, {
    tenantId: input.tenantId,
    requestId: input.requestId,
    limit: input.limit ?? DEFAULT_LIMIT,
  })
}

export async function getCorrelationAuditHistory(
  database: DatabaseClient,
  input: {
    tenantId: string
    correlationId: string
    limit?: number
  }
): Promise<AuditLog[]> {
  return queryAuditLogs(database, {
    tenantId: input.tenantId,
    correlationId: input.correlationId,
    limit: input.limit ?? DEFAULT_LIMIT,
  })
}

export async function getActorAuditHistory(
  database: DatabaseClient,
  input: {
    tenantId: string
    actorUserId: string
    limit?: number
  }
): Promise<AuditLog[]> {
  return queryAuditLogs(database, {
    tenantId: input.tenantId,
    actorUserId: input.actorUserId,
    limit: input.limit ?? DEFAULT_LIMIT,
  })
}
