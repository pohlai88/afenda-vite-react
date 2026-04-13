import { and, eq, isNotNull, lte } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { auditLogs, type AuditLog } from "../schema/audit-logs"

export async function queryAuditRowsForRetentionReview(
  database: DatabaseClient,
  input: {
    tenantId: string
    beforeRecordedAt: Date
    retentionClass?: string
    limit?: number
  }
): Promise<AuditLog[]> {
  const filters = [
    eq(auditLogs.tenantId, input.tenantId),
    lte(auditLogs.recordedAt, input.beforeRecordedAt),
  ]

  if (input.retentionClass) {
    filters.push(eq(auditLogs.retentionClass, input.retentionClass))
  } else {
    filters.push(isNotNull(auditLogs.retentionClass))
  }

  return database
    .select()
    .from(auditLogs)
    .where(and(...filters))
    .limit(input.limit ?? 500)
}
