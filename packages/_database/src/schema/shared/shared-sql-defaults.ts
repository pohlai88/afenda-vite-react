/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Shared** SQL fragments (`shared-sql-defaults.ts`) — not a domain `*.schema.ts`; used by column defaults and expressions. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/shared/shared-sql-defaults.ts` — `current_date` / empty JSONB / text-array SQL; `emptyJsonbSql` matches `metadataColumn` defaults in `columns.schema.ts`.
 */
import { sql } from "drizzle-orm"

export const currentDateSql = sql`current_date`
export const emptyJsonbSql = sql`'{}'::jsonb`
export const emptyTextArraySql = sql`'{}'::text[]`
