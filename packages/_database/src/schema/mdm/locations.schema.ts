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
 * This module: `src/schema/mdm/locations.schema.ts` — composite `(tenant_id, id)` is the FK target for `iam.tenant_memberships` defaults.
 * Temporal overlap exclusion (`effective_range`): `sql/hardening/patch_h_temporal_overlap.sql`.
 */

import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { countries } from "../ref/countries.schema"
import { timezones } from "../ref/timezones.schema"
import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { locationTypeEnum, statusEnum } from "../shared/enums.schema"
import { addresses } from "./addresses.schema"
import { businessUnits } from "./business-units.schema"
import { legalEntities } from "./legal-entities.schema"
import { mdm } from "./_schema"

/**
 * Location is the operational site boundary: branch / warehouse / store / plant.
 */
export const locations = mdm.table(
  "locations",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    businessUnitId: uuid("business_unit_id"),
    locationCode: varchar("location_code", { length: 50 }).notNull(),
    locationName: varchar("location_name", { length: 255 }).notNull(),
    locationType: locationTypeEnum("location_type").notNull(),
    addressId: uuid("address_id").references(() => addresses.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    timezoneName: varchar("timezone_name", { length: 100 })
      .notNull()
      .references(() => timezones.name, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    isOperatingSite: boolean("is_operating_site").notNull().default(true),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantLegalEntityCode: uniqueIndex(
      "uq_locations_tenant_legal_entity_code"
    ).on(table.tenantId, table.legalEntityId, table.locationCode),
    uqTenantIdId: unique("uq_locations_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_locations_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_locations_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_locations_tenant_business_unit",
    }),
    ckEffectiveDates: check(
      "ck_locations_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    idxAddress: index("idx_locations_address").on(table.addressId),
  })
)

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
