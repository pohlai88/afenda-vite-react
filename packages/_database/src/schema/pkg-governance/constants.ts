/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Package governance** — numeric and string constants for Drizzle Kit (`schemaFilter`, journal schema name). No DDL. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/pkg-governance/constants.ts` — `PG_IDENTIFIER_MAX_LENGTH`, `DRIZZLE_MIGRATIONS_SCHEMA`, `DRIZZLE_MANAGED_PG_SCHEMAS`.
 */

/**
 * Canonical Postgres identifier length (bytes). Longer names are truncated by the server.
 * @see https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
 */
export const PG_IDENTIFIER_MAX_LENGTH = 63

/** Drizzle Kit journal + migration table live in this PostgreSQL schema (see `drizzle.config.ts`). */
export const DRIZZLE_MIGRATIONS_SCHEMA = "drizzle" as const

export type DrizzleMigrationsSchema = typeof DRIZZLE_MIGRATIONS_SCHEMA

/**
 * Postgres namespaces owned by `@afenda/database` Drizzle schema (`pgSchema("iam")`, …).
 * `drizzle.config.ts` passes this to `schemaFilter` so `drizzle-kit push` reconciles only these
 * namespaces; objects outside this list are not touched by Drizzle Kit.
 */
export const DRIZZLE_MANAGED_PG_SCHEMAS = [
  "iam",
  "mdm",
  "ref",
  "finance",
  "governance",
  DRIZZLE_MIGRATIONS_SCHEMA,
] as const

export type DrizzleManagedPgSchema = (typeof DRIZZLE_MANAGED_PG_SCHEMAS)[number]
