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
 * This module: `src/schema/mdm/tenants.schema.ts` — tenant root, type, `generic_status`, ref FKs, governance, aliases, metadata, lifecycle, audit.
 */

import { sql } from "drizzle-orm"
import { check, date, index, uniqueIndex, varchar } from "drizzle-orm/pg-core"

import { countries } from "../ref/countries.schema"
import { currencies } from "../ref/currencies.schema"
import { locales } from "../ref/locales.schema"
import { timezones } from "../ref/timezones.schema"
import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  currencyCodeColumn,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import {
  governanceLevelEnum,
  statusEnum,
  tenantTypeEnum,
} from "../shared/enums.schema"
import { mdm } from "./_schema"

/**
 * Tenant is the business governance root.
 *
 * It is not a DevOps workspace.
 * It is the enterprise truth boundary for:
 * - structure
 * - policies
 * - master ownership
 * - access scope
 * - audit responsibility
 */
export const tenants = mdm.table(
  "tenants",
  {
    ...idColumn,
    tenantCode: varchar("tenant_code", { length: 50 }).notNull(),
    tenantName: varchar("tenant_name", { length: 200 }).notNull(),
    tenantType: tenantTypeEnum("tenant_type").notNull(),
    status: statusEnum("status").notNull(),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    reportingCurrencyCode: currencyCodeColumn(
      "reporting_currency_code"
    ).references(() => currencies.code, {
      onUpdate: "cascade",
      onDelete: "set null",
    }),
    defaultLocaleCode: varchar("default_locale_code", { length: 20 })
      .notNull()
      .references(() => locales.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    defaultTimezoneName: varchar("default_timezone_name", { length: 100 })
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
    activationDate: date("activation_date"),
    deactivationDate: date("deactivation_date"),
    mdmGovernanceLevel: governanceLevelEnum("mdm_governance_level").notNull(),
    ...aliasesColumn,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_tenants_tenant_code").on(table.tenantCode),
    idxStatus: index("idx_tenants_status").on(table.status),
    ckDeactivationDate: check(
      "ck_tenants_deactivation_date",
      sql`${table.deactivationDate} is null or ${table.activationDate} is null or ${table.deactivationDate} >= ${table.activationDate}`
    ),
  })
)

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
