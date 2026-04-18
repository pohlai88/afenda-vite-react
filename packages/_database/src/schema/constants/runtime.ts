/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **runtime env keys and pool defaults** under `src/schema/constants/` (consumed by `src/client.ts` for `pg` `Pool` configuration). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Isolation and immutability conventions align with `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * DDL graph or constraint changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/constants/runtime.ts` — public env var names and default pool tuning values for `createPgPool` / `DATABASE_URL`.
 */

/** Environment variable names read by `createPgPool` (`src/client.ts`). Values are the literal strings passed to `process.env[…]`. */
export const databaseRuntimeEnvKeys = {
  url: "DATABASE_URL",
  poolMax: "DB_POOL_MAX",
  idleTimeoutMs: "DB_IDLE_TIMEOUT_MS",
  connectionTimeoutMs: "DB_CONNECTION_TIMEOUT_MS",
  statementTimeoutMs: "DB_STATEMENT_TIMEOUT_MS",
} as const

/** Union of `databaseRuntimeEnvKeys` string literals (for validation, docs, or typed config maps). */
export type DatabaseRuntimeEnvKey =
  (typeof databaseRuntimeEnvKeys)[keyof typeof databaseRuntimeEnvKeys]

/**
 * Defaults when optional pool env vars are unset (`readOptionalInteger` in `src/client.ts`).
 * `createPgPool` applies `max`, `idleTimeoutMs` → `idleTimeoutMillis`, `connectionTimeoutMs` → `connectionTimeoutMillis`.
 * `statementTimeoutMs` / `DB_STATEMENT_TIMEOUT_MS` are catalogued for session-level timeout wiring (not yet passed into `Pool` in `client.ts`).
 */
export const defaultPoolSettings = {
  max: 10,
  idleTimeoutMs: 10_000,
  connectionTimeoutMs: 5_000,
  statementTimeoutMs: 30_000,
} as const

export type DefaultPoolSettings = typeof defaultPoolSettings
