/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Shared utilities under `src/schema/environment-support/` — env integer parsing and Zod coercions (no DDL). Migrations N/A for this barrel.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Isolation and immutability conventions align with `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * DDL graph or constraint changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/environment-support/index.ts` — barrel for `readOptionalInteger` and optional integer Zod helpers.
 */
export {
  optionalCoercedIntegerSchema,
  optionalIntegerWithDefault,
} from "./environment-integer.schema"
export { readOptionalInteger } from "./environment-integer-parsing"
