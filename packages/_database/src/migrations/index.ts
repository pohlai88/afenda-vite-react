/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle Kit emits versioned SQL + `meta/_journal.json` under `packages/_database/drizzle/` (gitignored until you commit them), not under this folder.
 * Import via `@afenda/database` only for app/runtime code; this module is a small layout anchor — prefer importing `DRIZZLE_MIGRATIONS_SCHEMA` from `@afenda/database` / `schema/pkg-governance` when wiring tools.
 * Not for browser bundles: migration layout is server/CI concern; DATABASE_URL stays server-side.
 * Raw PostgreSQL hardening and optional follow-on DDL live under `sql/hardening/` (applied per ops process), distinct from Drizzle-generated baselines.
 * Schema or relation changes require `db:guard` / `db:ci`; `pnpm run db:generate` writes to `drizzle/`; `pnpm run db:migrate` applies using the journal in the `drizzle` PostgreSQL schema (`drizzle.config.ts` → `migrations.schema`).
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/migrations/index.ts` — defines repo purpose of `src/migrations/`: tracked home for migration **layout** metadata only; generated migration files belong in `../../drizzle/` relative to this package.
 */
import { DRIZZLE_MIGRATIONS_SCHEMA } from "../schema/pkg-governance/constants.js"

/**
 * Single place to read how Drizzle Kit output relates to `src/migrations/` (this directory holds no generated `.sql`).
 *
 * - **`drizzleKitOutputDirRelativeToPackage`:** folder next to `src/` where `drizzle-kit generate` writes (see `drizzle.config.ts` `out`).
 * - **`drizzleKitPostgresSchema`:** PostgreSQL namespace for Kit’s journal/history tables (`migrations.schema` in config).
 */
export const AFENDA_DRIZZLE_MIGRATION_LAYOUT = {
  drizzleKitOutputDirRelativeToPackage: "drizzle" as const,
  drizzleKitPostgresSchema: DRIZZLE_MIGRATIONS_SCHEMA,
} as const
