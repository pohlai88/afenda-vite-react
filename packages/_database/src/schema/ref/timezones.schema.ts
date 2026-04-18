/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **ref** schema (`pgSchema("ref")`) — ISO / IANA reference tables (countries, currencies, locales, timezones, UoM). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/ref/timezones.schema.ts` — `ref.timezones` IANA names; FK target for `iam.user_accounts.timezone_name`.
 */
import { boolean, index, varchar } from "drizzle-orm/pg-core"

import { createdUpdatedVersionColumns } from "../shared/columns.schema"
import { ref } from "./_schema"

export const timezones = ref.table(
  "timezones",
  {
    name: varchar("name", { length: 100 }).primaryKey(),
    isActive: boolean("is_active").notNull().default(true),
    ...createdUpdatedVersionColumns,
  },
  (t) => ({
    activeIdx: index("idx_ref_timezones_active").on(t.isActive),
  })
)

export type Timezone = typeof timezones.$inferSelect
export type NewTimezone = typeof timezones.$inferInsert
