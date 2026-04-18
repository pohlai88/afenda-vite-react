/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; read-model resolvers and pure helpers under `src/queries/` (see `queries/README.md`).
 * Import via `@afenda/database` or `@afenda/database/queries`; do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Date semantics for resolvers follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/helpers/iso-date.ts` — strict `YYYY-MM-DD` calendar-day strings for resolver `asOfDate` (UTC day default).
 */
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function todayIsoDateUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Throws if the value is not `YYYY-MM-DD`. Call at resolver entry points that pass through to SQL `::date`.
 */
export function assertIsoDateOnly(value: string, paramName = "asOfDate"): void {
  if (typeof value !== "string" || !ISO_DATE_ONLY.test(value)) {
    throw new TypeError(
      `${paramName} must be an ISO 8601 calendar date string (YYYY-MM-DD)`
    )
  }
}

export function isIsoDateOnly(value: string): boolean {
  return ISO_DATE_ONLY.test(value)
}
