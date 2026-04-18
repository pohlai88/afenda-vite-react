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
 * This module: `7w1h-audit/services/insert-audit-log.ts` — canonical writer for `audit_logs` inserts (`insertAuditLog`, `insertGovernedAuditLog`).
 */
import type { DatabaseClient } from "../../client"
import {
  auditLogs,
  type AuditLog,
  type NewAuditLog,
} from "../audit-logs.schema"
import { type BuildAuditLogInput, buildAuditLog } from "./build-audit-log"
import { validateAuditLog } from "./validate-audit-log"

export type InsertAuditLogInput = Omit<
  NewAuditLog,
  "id" | "recordedAt" | "occurredAt"
> &
  Partial<Pick<NewAuditLog, "id" | "recordedAt" | "occurredAt">>

export async function insertAuditLog(
  db: DatabaseClient,
  input: InsertAuditLogInput
): Promise<AuditLog> {
  const now = new Date()
  const row = validateAuditLog({
    ...input,
    metadata: input.metadata ?? {},
    sevenW1h: input.sevenW1h ?? {},
    occurredAt: input.occurredAt ?? now,
    recordedAt: input.recordedAt ?? now,
  })

  const [created] = await db.insert(auditLogs).values(row).returning()
  if (!created) {
    throw new Error("insertAuditLog: expected one row from returning()")
  }
  return created
}

export async function insertGovernedAuditLog(
  db: DatabaseClient,
  input: BuildAuditLogInput
): Promise<AuditLog> {
  return insertAuditLog(db, buildAuditLog(input))
}
