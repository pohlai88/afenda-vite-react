/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; 7W1H audit modules under `src/7w1h-audit/` (re-exported via `schema/governance` for Drizzle Kit). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (@afenda/database, @afenda/database/7w1h-audit, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-25T00:00:00.000Z
 *
 * This module: `7w1h-audit/contracts/audit-change-contract.ts` — typed change-evidence contract adopted from the legacy audit package and normalized for 7W1H metadata.
 */
export const defaultAuditIgnoredFields = [
  "createdAt",
  "updatedAt",
  "version",
  "_count",
] as const

export const defaultAuditSensitiveFields = [
  "password",
  "token",
  "secret",
  "apiKey",
  "refreshToken",
  "accessToken",
  "privateKey",
  "sessionToken",
] as const

export interface AuditFieldChange {
  readonly field: string
  readonly oldValue: unknown
  readonly newValue: unknown
  readonly masked: boolean
}

export interface AuditChangeEvidence {
  readonly changes: readonly AuditFieldChange[]
  readonly previousValue?: unknown
  readonly nextValue?: unknown
}

export interface BuildAuditChangeEvidenceInput {
  readonly previousValue?: unknown
  readonly nextValue?: unknown
  readonly includeSnapshots?: boolean
  readonly ignoredFields?: readonly string[]
  readonly sensitiveFields?: readonly string[]
}
