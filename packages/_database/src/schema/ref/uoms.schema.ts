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
 * This module: `src/schema/ref/uoms.schema.ts` — `ref.uoms` unit-of-measure codes; FK target for `mdm.items.base_uom_code`.
 */
import { varchar } from "drizzle-orm/pg-core"

import { ref } from "./_schema"

export const uoms = ref.table("uoms", {
  code: varchar("code", { length: 20 }).primaryKey(),
})

export type Uom = typeof uoms.$inferSelect
export type NewUom = typeof uoms.$inferInsert
