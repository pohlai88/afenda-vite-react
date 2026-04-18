/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **mdm** schema (`pgSchema("mdm")`) — tenant master data, parties, items, org graph, policies, sequences. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/mdm/item-categories.schema.ts` — FK target for `mdm.items.category_id` via composite `(tenant_id, id)`.
 */

import { unique, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { idColumn, timestampColumns } from "../shared/columns.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

export const itemCategories = mdm.table(
  "item_categories",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    categoryCode: varchar("category_code", { length: 50 }).notNull(),
    categoryName: varchar("category_name", { length: 255 }).notNull(),
    ...timestampColumns,
  },
  (t) => ({
    tenantCodeUq: uniqueIndex("uq_item_categories_tenant_code").on(
      t.tenantId,
      t.categoryCode
    ),
    tenantIdIdUq: unique("uq_item_categories_tenant_id_id").on(
      t.tenantId,
      t.id
    ),
  })
)

export type ItemCategory = typeof itemCategories.$inferSelect
export type NewItemCategory = typeof itemCategories.$inferInsert
