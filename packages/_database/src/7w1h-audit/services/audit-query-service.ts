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
import {
  auditLogs,
  type AuditLog,
} from "../audit-logs.schema"
import {
  AUDIT_QUERY_W1H_PHASE_FILTER,
  AUDIT_QUERY_W1H_TEXT_FILTERS,
  auditSevenW1hPgPathLiteral,
} from "../contracts/audit-seven-w1h-query-manifest"
import {
  parseAuditQueryInput,
  type AuditQueryInput,
} from "../contracts/audit-query-contract"

function sevenW1hTextEq(pathLiteral: string, value: string): SQL {
  return sql`(${auditLogs.sevenW1h} #>> ${sql.raw(pathLiteral)}) = ${value}`
}

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

  for (const [inputKey, a, b] of AUDIT_QUERY_W1H_TEXT_FILTERS) {
    const value = query[inputKey as keyof AuditQueryInput]
    if (typeof value === "string" && value.length > 0) {
      filters.push(
        sevenW1hTextEq(auditSevenW1hPgPathLiteral([a, b]), value)
      )
    }
  }

  const phase = query[AUDIT_QUERY_W1H_PHASE_FILTER.key]
  if (phase !== undefined) {
    const [pa, pb] = AUDIT_QUERY_W1H_PHASE_FILTER.path
    filters.push(
      sevenW1hTextEq(auditSevenW1hPgPathLiteral([pa, pb]), phase)
    )
  }

  return database
    .select()
    .from(auditLogs)
    .where(and(...filters))
    .orderBy(desc(auditLogs.recordedAt))
    .limit(query.limit)
}
