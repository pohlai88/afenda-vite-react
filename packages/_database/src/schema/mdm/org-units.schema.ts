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
 * This module: `src/schema/mdm/org-units.schema.ts` — org hierarchy / reporting structure with optional anchoring to LE / BU / location; parent/child tree via `parent_org_unit_id`.
 * Temporal overlap / nullable-scope refinements: may be extended in SQL hardening when needed.
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

import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { orgUnitTypeEnum, statusEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { businessUnits } from "./business-units.schema"
import { legalEntities } from "./legal-entities.schema"
import { locations } from "./locations.schema"
import { tenants } from "./tenants.schema"

export const orgUnits = mdm.table(
  "org_units",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    parentOrgUnitId: uuid("parent_org_unit_id"),
    orgUnitCode: varchar("org_unit_code", { length: 50 }).notNull(),
    orgUnitName: varchar("org_unit_name", { length: 255 }).notNull(),
    orgUnitType: orgUnitTypeEnum("org_unit_type").notNull(),
    status: statusEnum("status").notNull().default("active"),
    ...aliasesColumn,
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_org_units_tenant_code").on(
      table.tenantId,
      table.orgUnitCode
    ),
    uqTenantIdId: unique("uq_org_units_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_org_units_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_org_units_legal_entity",
    }),
    fkBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_org_units_business_unit",
    }),
    fkLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_org_units_location",
    }),
    fkParentOrgUnit: foreignKey({
      columns: [table.tenantId, table.parentOrgUnitId],
      foreignColumns: [table.tenantId, table.id],
      name: "fk_org_units_parent",
    }),
    ckEffectiveDates: check(
      "ck_org_units_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckScopeShape: check(
      "ck_org_units_scope_shape",
      sql`(
        (${table.locationId} is null or ${table.legalEntityId} is not null)
        and
        (${table.businessUnitId} is null or ${table.legalEntityId} is not null)
      )`
    ),
  })
)

export type OrgUnit = typeof orgUnits.$inferSelect
export type NewOrgUnit = typeof orgUnits.$inferInsert
