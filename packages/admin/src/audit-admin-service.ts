import {
  auditLogs,
  db,
  insertAuditLog,
  userAccounts,
  type DatabaseClient,
} from "@afenda/database"
import { and, desc, eq, gte, lte, sql } from "drizzle-orm"

import type {
  AuditChanges,
  AuditEntry,
  AuditQueryParams,
  AuditWriteEntry,
} from "./contracts"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isAuditChanges(value: unknown): value is AuditChanges {
  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every((entry) => {
    return (
      isRecord(entry) &&
      Object.prototype.hasOwnProperty.call(entry, "old") &&
      Object.prototype.hasOwnProperty.call(entry, "new")
    )
  })
}

function extractChanges(metadata: Record<string, unknown>): AuditChanges {
  if (isAuditChanges(metadata.changes)) {
    return metadata.changes
  }

  return {}
}

function extractStringMetadata(
  metadata: Record<string, unknown>,
  key: string
): string | undefined {
  const value = metadata[key]
  return typeof value === "string" ? value : undefined
}

export class AuditService {
  constructor(private readonly database: DatabaseClient = db) {}

  async log(entry: AuditWriteEntry): Promise<void> {
    await insertAuditLog(this.database, {
      tenantId: entry.tenantId,
      actorType: "person",
      actorUserId: entry.userId,
      action: entry.action,
      subjectType: entry.entity,
      subjectId: entry.entityId,
      metadata: {
        changes: entry.changes ?? {},
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        legacyAdminAdaptation: true,
      },
      sourceChannel: "ui",
      outcome: "success",
      requestId: entry.requestId,
      traceId: entry.traceId,
      correlationId: entry.correlationId,
      occurredAt: new Date(),
      recordedAt: new Date(),
      sevenW1h: {
        which: {
          targetEntityRef: entry.entityId,
          targetFeature: entry.entity,
        },
        how: {
          mechanism: "legacy-admin-adaptation",
          interactionPhase: "succeeded",
        },
      },
    })
  }

  async query(
    params: AuditQueryParams
  ): Promise<{ data: AuditEntry[]; total: number }> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 50
    const filters = [eq(auditLogs.tenantId, params.tenantId)]

    if (params.entity) {
      filters.push(eq(auditLogs.subjectType, params.entity))
    }
    if (params.entityId) {
      filters.push(eq(auditLogs.subjectId, params.entityId))
    }
    if (params.userId) {
      filters.push(eq(auditLogs.actorUserId, params.userId))
    }
    if (params.action) {
      filters.push(eq(auditLogs.action, params.action))
    }
    if (params.from) {
      filters.push(gte(auditLogs.recordedAt, params.from))
    }
    if (params.to) {
      filters.push(lte(auditLogs.recordedAt, params.to))
    }

    const [rows, totalRows] = await Promise.all([
      this.database
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          entity: auditLogs.subjectType,
          entityId: auditLogs.subjectId,
          userId: auditLogs.actorUserId,
          userName: userAccounts.displayName,
          tenantId: auditLogs.tenantId,
          metadata: auditLogs.metadata,
          createdAt: auditLogs.recordedAt,
        })
        .from(auditLogs)
        .leftJoin(userAccounts, eq(auditLogs.actorUserId, userAccounts.id))
        .where(and(...filters))
        .orderBy(desc(auditLogs.recordedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      this.database
        .select({
          total: sql<number>`count(*)`.mapWith(Number),
        })
        .from(auditLogs)
        .where(and(...filters)),
    ])

    const total = totalRows[0]?.total ?? 0

    return {
      data: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entity: row.entity,
        entityId: row.entityId ?? "",
        userId: row.userId ?? "",
        userName: row.userName ?? "",
        tenantId: row.tenantId,
        changes: extractChanges(row.metadata),
        ipAddress: extractStringMetadata(row.metadata, "ipAddress"),
        userAgent: extractStringMetadata(row.metadata, "userAgent"),
        createdAt: row.createdAt,
      })),
      total,
    }
  }
}
