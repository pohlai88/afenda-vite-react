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
 * This module: `src/schema/ref/currencies.schema.ts` — `ref.currencies` ISO 4217; FK target for MDM / pricing metadata.
 */
import { sql } from "drizzle-orm"
import {
  boolean,
  char,
  check,
  index,
  smallint,
  varchar,
} from "drizzle-orm/pg-core"

import { createdUpdatedVersionColumns } from "../shared/columns.schema"
import { ref } from "./_schema"

export const currencies = ref.table(
  "currencies",
  {
    code: char("code", { length: 3 }).primaryKey(),
    numericCode: char("numeric_code", { length: 3 }),
    name: varchar("name", { length: 100 }).notNull(),
    symbol: varchar("symbol", { length: 10 }),
    minorUnit: smallint("minor_unit").notNull().default(2),
    isActive: boolean("is_active").notNull().default(true),
    ...createdUpdatedVersionColumns,
  },
  (t) => ({
    minorUnitCheck: check(
      "ck_currencies_minor_unit",
      sql`${t.minorUnit} >= 0 and ${t.minorUnit} <= 6`
    ),
    nameIdx: index("idx_ref_currencies_name").on(t.name),
  })
)

export type Currency = typeof currencies.$inferSelect
export type NewCurrency = typeof currencies.$inferInsert
