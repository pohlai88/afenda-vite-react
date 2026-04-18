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
 * This module: `src/schema/mdm/items.schema.ts` — material master rows per tenant; ownership scope mirrors `mdm.parties`.
 */

import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { dataSources } from "../governance/data-sources.schema"
import { uoms } from "../ref/uoms.schema"
import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import {
  itemTypeEnum,
  mdmStatusEnum,
  ownershipLevelEnum,
  statusEnum,
  valuationMethodEnum,
} from "../shared/enums.schema"
import { businessUnits } from "./business-units.schema"
import { itemCategories } from "./item-categories.schema"
import { legalEntities } from "./legal-entities.schema"
import { locations } from "./locations.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

/**
 * Item is the canonical product / service / asset / expense master.
 */
export const items = mdm.table(
  "items",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    itemCode: varchar("item_code", { length: 50 }).notNull(),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    itemType: itemTypeEnum("item_type").notNull(),
    baseUomCode: varchar("base_uom_code", { length: 20 })
      .notNull()
      .references(() => uoms.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    categoryId: uuid("category_id"),
    ownershipLevel: ownershipLevelEnum("ownership_level")
      .notNull()
      .default("tenant"),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    valuationMethod: valuationMethodEnum("valuation_method"),
    status: statusEnum("status").notNull(),
    mdmStatus: mdmStatusEnum("mdm_status").notNull().default("golden"),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_items_tenant_code").on(
      table.tenantId,
      table.itemCode
    ),
    uqTenantIdId: unique("uq_items_tenant_id_id").on(table.tenantId, table.id),
    idxTenantStatus: index("idx_items_tenant_status").on(
      table.tenantId,
      table.status
    ),
    idxTenantMdmStatus: index("idx_items_tenant_mdm_status").on(
      table.tenantId,
      table.mdmStatus
    ),
    idxTenantCategory: index("idx_items_tenant_category").on(
      table.tenantId,
      table.categoryId
    ),
    idxSourceSystem: index("idx_items_source_system").on(table.sourceSystemId),
    fkCategory: foreignKey({
      columns: [table.tenantId, table.categoryId],
      foreignColumns: [itemCategories.tenantId, itemCategories.id],
      name: "fk_items_category",
    }),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_items_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_items_tenant_business_unit",
    }),
    fkTenantLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_items_tenant_location",
    }),
    ckEffectiveDates: check(
      "ck_items_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckOwnershipScope: check(
      "ck_items_ownership_scope",
      sql`(
        (${table.ownershipLevel} = 'tenant' and ${table.legalEntityId} is null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'legal_entity' and ${table.legalEntityId} is not null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'business_unit' and ${table.legalEntityId} is not null and ${table.businessUnitId} is not null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'location' and ${table.legalEntityId} is not null and ${table.locationId} is not null)
      )`
    ),
  })
)

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
