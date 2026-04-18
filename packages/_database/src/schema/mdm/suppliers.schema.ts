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
 * This module: `src/schema/mdm/suppliers.schema.ts` — commercial supplier facet; PK = `party_id` (1:1 with `mdm.parties`). Mirrors `customers.schema.ts` patterns.
 */

import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  integer,
  numeric,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { currencies } from "../ref/currencies.schema"
import {
  createdUpdatedVersionActorColumns,
  currencyCodeColumn,
  metadataColumn,
} from "../shared/columns.schema"
import { statusEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { parties } from "./parties.schema"

export const suppliers = mdm.table(
  "suppliers",
  {
    partyId: uuid("party_id")
      .primaryKey()
      .references(() => parties.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id").notNull(),
    supplierGroupCode: varchar("supplier_group_code", { length: 50 }),
    paymentTermCode: varchar("payment_term_code", { length: 50 }),
    taxProfileCode: varchar("tax_profile_code", { length: 50 }),
    leadTimeDays: integer("lead_time_days"),
    minOrderAmount: numeric("min_order_amount", {
      precision: 18,
      scale: 2,
    }),
    currencyCode: currencyCodeColumn("currency_code").references(
      () => currencies.code,
      { onUpdate: "cascade", onDelete: "set null" }
    ),
    supplierStatus: statusEnum("supplier_status").notNull().default("active"),
    ...metadataColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    idxTenantStatus: index("idx_suppliers_tenant_status").on(
      table.tenantId,
      table.supplierStatus
    ),
    fkTenantParty: foreignKey({
      columns: [table.tenantId, table.partyId],
      foreignColumns: [parties.tenantId, parties.id],
      name: "fk_suppliers_tenant_party",
    }),
    idxTenantParty: index("idx_suppliers_tenant_party").on(
      table.tenantId,
      table.partyId
    ),
    ckLeadTime: check(
      "ck_suppliers_lead_time_days",
      sql`${table.leadTimeDays} is null or ${table.leadTimeDays} >= 0`
    ),
    ckMinOrder: check(
      "ck_suppliers_min_order_amount",
      sql`${table.minOrderAmount} is null or ${table.minOrderAmount} >= 0`
    ),
  })
)

export type Supplier = typeof suppliers.$inferSelect
export type NewSupplier = typeof suppliers.$inferInsert
