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
 * This module: `src/schema/mdm/item-entity-settings.schema.ts` — item posting / planning overrides per tenant + entity scope.
 * **NULL and uniqueness:** partial indexes in `sql/hardening/patch_e_nullable_scope_uniqueness.sql` (replaces the raw scope unique below when applied).
 * **Temporal overlap:** `effective_range` + scope-split EXCLUDEs in `patch_h_temporal_overlap.sql`; `patch_n_temporal_overlap_wave.sql` idempotently ensures `effective_range` exists for stricter deployments.
 */

import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  jsonb,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { accounts } from "../finance/accounts.schema"
import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { businessUnits } from "./business-units.schema"
import { items } from "./items.schema"
import { legalEntities } from "./legal-entities.schema"
import { locations } from "./locations.schema"
import { mdm } from "./_schema"

/**
 * Item entity settings resolve operational / finance behavior by scope.
 *
 * Intended fallback order:
 * - location
 * - business unit
 * - legal entity
 *
 * Nullable scoped uniqueness is hardened in SQL migration, not only here.
 */
export const itemEntitySettings = mdm.table(
  "item_entity_settings",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    itemId: uuid("item_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    salesAccountId: uuid("sales_account_id"),
    inventoryAccountId: uuid("inventory_account_id"),
    cogsAccountId: uuid("cogs_account_id"),
    priceListCode: varchar("price_list_code", { length: 50 }),
    reorderPolicy: jsonb("reorder_policy")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    isActive: boolean("is_active").notNull().default(true),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqScopeRaw: uniqueIndex("uq_item_entity_settings_scope").on(
      table.tenantId,
      table.itemId,
      table.legalEntityId,
      table.businessUnitId,
      table.locationId,
      table.effectiveFrom
    ),
    idxLookup: index("idx_item_entity_settings_lookup").on(
      table.tenantId,
      table.itemId,
      table.legalEntityId,
      table.businessUnitId,
      table.locationId,
      table.effectiveFrom
    ),
    fkItem: foreignKey({
      columns: [table.tenantId, table.itemId],
      foreignColumns: [items.tenantId, items.id],
      name: "fk_item_entity_settings_item",
    }),
    fkLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_item_entity_settings_legal_entity",
    }),
    fkBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_item_entity_settings_business_unit",
    }),
    fkLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_item_entity_settings_location",
    }),
    fkSalesAccount: foreignKey({
      columns: [table.tenantId, table.salesAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_sales_account",
    }),
    fkInventoryAccount: foreignKey({
      columns: [table.tenantId, table.inventoryAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_inventory_account",
    }),
    fkCogsAccount: foreignKey({
      columns: [table.tenantId, table.cogsAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_cogs_account",
    }),
    ckEffectiveDates: check(
      "ck_item_entity_settings_dates",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)

export type ItemEntitySetting = typeof itemEntitySettings.$inferSelect
export type NewItemEntitySetting = typeof itemEntitySettings.$inferInsert
