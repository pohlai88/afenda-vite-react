/**
 * Canonical Postgres identifier length (bytes). Longer names are truncated by the server.
 * @see https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
 */
export const PG_IDENTIFIER_MAX_LENGTH = 63

/** Drizzle Kit journal + migration table live in this PostgreSQL schema (see `drizzle.config.ts`). */
export const DRIZZLE_MIGRATIONS_SCHEMA = "drizzle" as const

export type DrizzleMigrationsSchema = typeof DRIZZLE_MIGRATIONS_SCHEMA
