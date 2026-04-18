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
 * This module: `7w1h-audit/services/validate-audit-log.ts` — runtime checks before insert (tenant, subject, action catalog, UI actor rules).
 */
import type { NewAuditLog } from "../audit-logs.schema"
import { isAuditActionKey } from "../contracts/audit-action-catalog"

export function validateAuditLog(row: NewAuditLog): NewAuditLog {
  if (!row.tenantId) {
    throw new Error("tenantId is required")
  }

  if (!row.subjectType) {
    throw new Error("subjectType is required")
  }

  if (!isAuditActionKey(row.action)) {
    throw new Error(`Unknown audit action: ${row.action}`)
  }

  if (row.sourceChannel === "ui" && row.actorType === "unknown") {
    throw new Error("UI audit rows must not use actorType=unknown")
  }

  return row
}
