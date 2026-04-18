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
 * This module: `7w1h-audit/contracts/audit-action-catalog.ts` — allowed `action` keys for governed audit rows.
 */
export const auditActionKeys = [
  "auth.account.linked",
  "auth.login.succeeded",
  "auth.session.created",
  "auth.session.revoked",
  "auth.user.updated",
  "shell.interaction.recorded",
] as const

export type AuditActionKey = (typeof auditActionKeys)[number]

export function isAuditActionKey(value: string): value is AuditActionKey {
  return auditActionKeys.includes(value as AuditActionKey)
}
