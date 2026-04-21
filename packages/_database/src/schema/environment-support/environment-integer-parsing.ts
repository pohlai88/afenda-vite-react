/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Shared utilities under `src/schema/environment-support/` — framework-agnostic integer parsing from env strings (no DDL; used by `src/client.ts`). Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Isolation and immutability conventions align with `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * DDL graph or constraint changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/environment-support/environment-integer-parsing.ts` — `readOptionalInteger` for safe `process.env` → number coercion (keep wording generic; see `schema-support-boundary.test.ts`).
 */
const INTEGER_STRING = /^-?\d+$/u

/**
 * Parses a trimmed string as a base-10 integer, or returns `fallback` when the value is absent,
 * empty, not a plain integer token (for example `12.3` or `99x`), or outside the safe integer range.
 */
export function readOptionalInteger(
  raw: string | undefined,
  fallback: number
): number {
  if (raw === undefined) {
    return fallback
  }

  const trimmed = raw.trim()
  if (trimmed === "") {
    return fallback
  }

  if (!INTEGER_STRING.test(trimmed)) {
    return fallback
  }

  const parsed = Number.parseInt(trimmed, 10)
  if (!Number.isSafeInteger(parsed)) {
    return fallback
  }

  return parsed
}
