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
 * This module: `src/schema/mdm/legal-entities.schema.ts` — composite `(tenant_id, id)` is the FK target for `iam.tenant_memberships` defaults.
 * Optional `registration_number` / `tax_registration_number` soft-delete-aware uniqueness: `sql/hardening/patch_d_partial_unique_indexes.sql`.
 * `fiscal_calendar_id` → composite `(tenant_id, id)` on `finance.fiscal_calendars` (nullable = no calendar).
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

import { fiscalCalendars } from "../finance/fiscal-calendars.schema"
import { countries } from "../ref/countries.schema"
import { currencies } from "../ref/currencies.schema"
import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  currencyCodeColumn,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { legalEntityTypeEnum, statusEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

/**
 * Legal entity is the accounting / statutory boundary beneath tenant.
 *
 * Every finance-sensitive ERP runtime should resolve through this layer.
 */
export const legalEntities = mdm.table(
  "legal_entities",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    entityCode: varchar("entity_code", { length: 50 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    tradingName: varchar("trading_name", { length: 255 }),
    entityType: legalEntityTypeEnum("entity_type").notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    fiscalCalendarId: uuid("fiscal_calendar_id"),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_legal_entities_tenant_code").on(
      table.tenantId,
      table.entityCode
    ),
    uqTenantIdId: unique("uq_legal_entities_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_legal_entities_tenant_status").on(
      table.tenantId,
      table.status
    ),
    ckEffectiveDates: check(
      "ck_legal_entities_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    fkFiscalCalendar: foreignKey({
      columns: [table.tenantId, table.fiscalCalendarId],
      foreignColumns: [fiscalCalendars.tenantId, fiscalCalendars.id],
      name: "fk_legal_entities_fiscal_calendar",
    }),
    idxFiscalCalendar: index("idx_legal_entities_fiscal_calendar").on(
      table.tenantId,
      table.fiscalCalendarId
    ),
  })
)

export type LegalEntity = typeof legalEntities.$inferSelect
export type NewLegalEntity = typeof legalEntities.$inferInsert
