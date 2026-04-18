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
 * This module: `src/schema/mdm/tax-registrations.schema.ts` — tax IDs per legal entity **or** party (exclusive); composite tenant-safe FKs to LE / party.
 */

import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { countries } from "../ref/countries.schema"
import {
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { statusEnum, taxRegistrationTypeEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { legalEntities } from "./legal-entities.schema"
import { parties } from "./parties.schema"
import { tenants } from "./tenants.schema"

export const taxRegistrations = mdm.table(
  "tax_registrations",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    legalEntityId: uuid("legal_entity_id"),
    partyId: uuid("party_id"),
    registrationType: taxRegistrationTypeEnum("registration_type").notNull(),
    taxTypeCode: varchar("tax_type_code", { length: 50 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 120 }).notNull(),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    status: statusEnum("status").notNull().default("active"),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantRegistration: uniqueIndex(
      "uq_tax_registrations_tenant_registration"
    ).on(
      table.tenantId,
      table.registrationType,
      table.registrationNumber
    ),
    idxTenantLookup: index("idx_tax_registrations_lookup").on(
      table.tenantId,
      table.legalEntityId,
      table.partyId,
      table.taxTypeCode
    ),
    fkLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_tax_registrations_legal_entity",
    }),
    fkParty: foreignKey({
      columns: [table.tenantId, table.partyId],
      foreignColumns: [parties.tenantId, parties.id],
      name: "fk_tax_registrations_party",
    }),
    ckOwnerShape: check(
      "ck_tax_registrations_owner_shape",
      sql`(
        (${table.legalEntityId} is not null and ${table.partyId} is null)
        or
        (${table.legalEntityId} is null and ${table.partyId} is not null)
      )`
    ),
    ckEffectiveDates: check(
      "ck_tax_registrations_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)

export type TaxRegistration = typeof taxRegistrations.$inferSelect
export type NewTaxRegistration = typeof taxRegistrations.$inferInsert
