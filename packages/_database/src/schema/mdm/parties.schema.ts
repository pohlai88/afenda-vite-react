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
 * This module: `src/schema/mdm/parties.schema.ts` — central party / customer–supplier root per tenant (golden-record territory).
 * **Generated columns:** do not use Drizzle’s generated-column APIs for `canonical_name_normalized`. Baseline DDL may declare a plain `text` placeholder; `GENERATED … STORED` is applied only in raw SQL (`sql/hardening/patch_b_parties_canonical_name_normalized.sql`).
 */

import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  text,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { dataSources } from "../governance/governance-data-sources.schema"
import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import {
  mdmStatusEnum,
  ownershipLevelEnum,
  partyTypeEnum,
  statusEnum,
} from "../shared/enums.schema"
import { businessUnits } from "./business-units.schema"
import { legalEntities } from "./legal-entities.schema"
import { locations } from "./locations.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

/**
 * Party is the canonical business counterparty / person / organization master.
 *
 * This is golden-record territory.
 * Ownership scope check is intentional and should stay hard in DB.
 */
export const parties = mdm.table(
  "parties",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    partyCode: varchar("party_code", { length: 50 }).notNull(),
    partyType: partyTypeEnum("party_type").notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    canonicalName: varchar("canonical_name", { length: 255 }).notNull(),
    /** Plain column in baseline; stored generated definition is patch SQL only — see module doc. */
    canonicalNameNormalized: text("canonical_name_normalized"),
    ownershipLevel: ownershipLevelEnum("ownership_level")
      .notNull()
      .default("tenant"),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    status: statusEnum("status").notNull(),
    mdmStatus: mdmStatusEnum("mdm_status").notNull(),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    goldenRecordId: uuid("golden_record_id"),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_parties_tenant_code").on(
      table.tenantId,
      table.partyCode
    ),
    uqTenantIdId: unique("uq_parties_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_parties_tenant_status").on(
      table.tenantId,
      table.status
    ),
    idxTenantMdmStatus: index("idx_parties_tenant_mdm_status").on(
      table.tenantId,
      table.mdmStatus
    ),
    idxSourceSystem: index("idx_parties_source_system").on(
      table.sourceSystemId
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_parties_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_parties_tenant_business_unit",
    }),
    fkTenantLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_parties_tenant_location",
    }),
    ckEffectiveDates: check(
      "ck_parties_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckOwnershipScope: check(
      "ck_parties_ownership_scope",
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

export type Party = typeof parties.$inferSelect
export type NewParty = typeof parties.$inferInsert
