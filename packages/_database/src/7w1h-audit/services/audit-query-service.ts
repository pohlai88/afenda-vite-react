/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; 7W1H audit modules under `src/7w1h-audit/` (re-exported via `schema/governance` for Drizzle Kit). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (@afenda/database, @afenda/database/7w1h-audit, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `7w1h-audit/services/audit-query-service.ts` — list `audit_logs` with optional `seven_w1h` JSON path filters.
 */
import { and, desc, eq, gte, lte, sql } from "drizzle-orm"
import type { SQL } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { auditLogs, type AuditLog } from "../audit-logs.schema"
import {
  AUDIT_QUERY_W1H_PHASE_FILTER,
  AUDIT_QUERY_W1H_TEXT_FILTERS,
  auditSevenW1hPgPathLiteral,
} from "../contracts/audit-seven-w1h-query-manifest"
import {
  parseAuditQueryInput,
  type AuditQueryInput,
} from "../contracts/audit-query-contract"

export type AuditQueryRequest = Pick<AuditQueryInput, "tenantId"> &
  Partial<Omit<AuditQueryInput, "tenantId">>

function sevenW1hTextEq(pathLiteral: string, value: string): SQL {
  return sql`(${auditLogs.sevenW1h} #>> ${sql.raw(pathLiteral)}) = ${value}`
}

function buildAuditQueryFilters(query: AuditQueryInput): SQL[] {
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

  for (const [inputKey, a, b] of AUDIT_QUERY_W1H_TEXT_FILTERS) {
    const value = query[inputKey as keyof AuditQueryInput]
    if (typeof value === "string" && value.length > 0) {
      filters.push(sevenW1hTextEq(auditSevenW1hPgPathLiteral([a, b]), value))
    }
  }

  const phase = query[AUDIT_QUERY_W1H_PHASE_FILTER.key]
  if (phase !== undefined) {
    const [pa, pb] = AUDIT_QUERY_W1H_PHASE_FILTER.path
    filters.push(sevenW1hTextEq(auditSevenW1hPgPathLiteral([pa, pb]), phase))
  }

  return filters
}

export interface AuditLogPage {
  readonly entries: readonly AuditLog[]
  readonly total: number
}

export async function countAuditLogs(
  database: DatabaseClient,
  input: Omit<AuditQueryRequest, "limit" | "offset">
): Promise<number> {
  const query = parseAuditQueryInput({
    ...input,
    limit: 1,
    offset: 0,
  })
  const filters = buildAuditQueryFilters(query)
  const [result] = await database
    .select({
      total: sql<number>`count(*)::int`,
    })
    .from(auditLogs)
    .where(and(...filters))

  return Number(result?.total ?? 0)
}

export async function queryAuditLogs(
  database: DatabaseClient,
  input: AuditQueryRequest
): Promise<AuditLog[]> {
  const query = parseAuditQueryInput(input)
  const filters = buildAuditQueryFilters(query)

  return database
    .select()
    .from(auditLogs)
    .where(and(...filters))
    .orderBy(desc(auditLogs.recordedAt))
    .limit(query.limit)
    .offset(query.offset)
}

export async function queryAuditLogPage(
  database: DatabaseClient,
  input: AuditQueryRequest
): Promise<AuditLogPage> {
  const query = parseAuditQueryInput(input)
  const [entries, total] = await Promise.all([
    queryAuditLogs(database, query),
    countAuditLogs(database, query),
  ])

  return { entries, total }
}

export async function getAuditSubjectHistory(
  database: DatabaseClient,
  input: {
    readonly tenantId: string
    readonly subjectType: string
    readonly subjectId: string
    readonly limit?: number
    readonly offset?: number
  }
): Promise<AuditLogPage> {
  return queryAuditLogPage(database, {
    tenantId: input.tenantId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    limit: input.limit ?? 100,
    offset: input.offset ?? 0,
  })
}

export async function getAuditActorActivity(
  database: DatabaseClient,
  input: {
    readonly tenantId: string
    readonly actorUserId: string
    readonly action?: string
    readonly outcome?: AuditQueryInput["outcome"]
    readonly fromRecordedAt?: Date
    readonly toRecordedAt?: Date
    readonly limit?: number
    readonly offset?: number
  }
): Promise<AuditLogPage> {
  return queryAuditLogPage(database, {
    tenantId: input.tenantId,
    actorUserId: input.actorUserId,
    action: input.action,
    outcome: input.outcome,
    fromRecordedAt: input.fromRecordedAt,
    toRecordedAt: input.toRecordedAt,
    limit: input.limit ?? 100,
    offset: input.offset ?? 0,
  })
}

export async function getAuditModuleActivity(
  database: DatabaseClient,
  input: {
    readonly tenantId: string
    readonly targetModule: string
    readonly action?: string
    readonly fromRecordedAt?: Date
    readonly toRecordedAt?: Date
    readonly limit?: number
    readonly offset?: number
  }
): Promise<AuditLogPage> {
  return queryAuditLogPage(database, {
    tenantId: input.tenantId,
    w1hWhichTargetModule: input.targetModule,
    action: input.action,
    fromRecordedAt: input.fromRecordedAt,
    toRecordedAt: input.toRecordedAt,
    limit: input.limit ?? 100,
    offset: input.offset ?? 0,
  })
}
