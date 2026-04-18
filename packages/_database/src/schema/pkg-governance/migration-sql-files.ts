/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Package governance** — regex and parsers for Drizzle Kit migration filenames (`NNNN_slug.sql`). No DDL. Migrations N/A for this file (defines naming rules for migration **files**).
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/pkg-governance/migration-sql-files.ts` — `DRIZZLE_MIGRATION_SQL_FILENAME`, `parseMigrationSqlFilename`, `isMigrationSqlFilename`.
 */
/**
 * Drizzle Kit writes migration files under `drizzle.config.ts` → `out` (default `./drizzle`).
 *
 * **Filename pattern (generated):** `NNNN_descriptive_slug.sql`
 * - `NNNN` — zero-padded sequence from journal (0000, 0001, …)
 * - `descriptive_slug` — snake_case token from `drizzle-kit generate` (Drizzle derives a label from the diff; you can steer it with a custom name where supported)
 *
 * **Governed convention (human + review):** use a slug that reads:
 * `{domain}_{entity}_{action}` or `{domain}_{concern}` — all lowercase, digits only when needed, underscores between segments.
 *
 * Examples (intent, not guaranteed to match Kit’s auto-slug):
 * - `tenancy_tenants_initial`
 * - `audit_logs_append_only_guard`
 * - `authorization_roles_permissions_m2m`
 *
 * **CLI:** from `packages/_database`, prefer an explicit name when your CLI supports it, e.g.
 * `pnpm exec drizzle-kit generate --name tenancy_tenants_initial`
 * (exact flags depend on your `drizzle-kit` version — check `drizzle-kit generate --help`.)
 */
export const DRIZZLE_MIGRATION_SQL_FILENAME =
  /^(?<index>\d{4})_(?<slug>[a-z0-9_]+)\.sql$/u

export type ParsedMigrationSqlFilename = {
  index: string
  slug: string
}

export function parseMigrationSqlFilename(
  filename: string
): ParsedMigrationSqlFilename | null {
  const m = DRIZZLE_MIGRATION_SQL_FILENAME.exec(filename)
  if (!m?.groups?.index || !m.groups.slug) return null
  return { index: m.groups.index, slug: m.groups.slug }
}

export function isMigrationSqlFilename(filename: string): boolean {
  return DRIZZLE_MIGRATION_SQL_FILENAME.test(filename)
}

export { DRIZZLE_MIGRATIONS_SCHEMA } from "./constants.js"
