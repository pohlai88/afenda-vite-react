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
 * This module: `src/schema/mdm/business-units.schema.ts` — composite `(tenant_id, id)` is the FK target for `iam.tenant_memberships` defaults.
 * Temporal overlap exclusion (`effective_range`): `sql/hardening/patch_h_temporal_overlap.sql`.
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

import { persons } from "../iam/persons.schema"
import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { businessUnitTypeEnum, statusEnum } from "../shared/enums.schema"
import { legalEntities } from "./legal-entities.schema"
import { mdm } from "./_schema"

/**
 * Business unit is an operational / managerial structure beneath legal entity.
 *
 * Composite tenant-safe FK is intentional.
 */
export const businessUnits = mdm.table(
  "business_units",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    buCode: varchar("bu_code", { length: 50 }).notNull(),
    buName: varchar("bu_name", { length: 255 }).notNull(),
    buType: businessUnitTypeEnum("bu_type").notNull(),
    managerPersonId: uuid("manager_person_id").references(() => persons.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantLegalEntityCode: uniqueIndex(
      "uq_business_units_tenant_legal_entity_code"
    ).on(table.tenantId, table.legalEntityId, table.buCode),
    uqTenantIdId: unique("uq_business_units_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_business_units_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_business_units_tenant_legal_entity",
    }),
    ckEffectiveDates: check(
      "ck_business_units_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    idxManagerPerson: index("idx_business_units_manager_person").on(
      table.managerPersonId
    ),
  })
)

export type BusinessUnit = typeof businessUnits.$inferSelect
export type NewBusinessUnit = typeof businessUnits.$inferInsert
