/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle `relations()` graphs under `src/relations/` (not `pgTable` DDL).
 * Import via `@afenda/database/relations`; do not deep-import `src/` from apps.
 * Not for browser bundles: server-only Drizzle + `pg`.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `relations/ref-relations.ts` — **inverse** `many()` from `ref` masters to MDM/IAM children; forward `one(ref.*)` stays in domain graphs.
 * Completes relational queries (`with: { tenantsAsBaseCurrency: true }`, etc.); edges mirror real FKs in schema modules.
 */
import { relations } from "drizzle-orm"

import { DRIZZLE_RELATION_NAME } from "./relation-names"

import { userAccounts } from "../schema/iam/user-accounts.schema"
import { customers } from "../schema/mdm/customers.schema"
import { items } from "../schema/mdm/items.schema"
import { legalEntities } from "../schema/mdm/legal-entities.schema"
import { locations } from "../schema/mdm/locations.schema"
import { suppliers } from "../schema/mdm/suppliers.schema"
import { taxRegistrations } from "../schema/mdm/tax-registrations.schema"
import { tenantLabelOverrides } from "../schema/mdm/tenant-label-overrides.schema"
import { tenants } from "../schema/mdm/tenants.schema"
import { countries } from "../schema/ref/countries.schema"
import { currencies } from "../schema/ref/currencies.schema"
import { locales } from "../schema/ref/locales.schema"
import { timezones } from "../schema/ref/timezones.schema"
import { uoms } from "../schema/ref/uoms.schema"

/** ISO 3166-1 rows referenced by `mdm.tenants.country_code`, `mdm.legal_entities.country_code`, … */
export const countriesRelations = relations(countries, ({ many }) => ({
  tenants: many(tenants),
  legalEntities: many(legalEntities),
  taxRegistrations: many(taxRegistrations),
  locations: many(locations),
}))

/** ISO 4217 rows — two explicit edges to `tenants` for base vs reporting currency. */
export const currenciesRelations = relations(currencies, ({ many }) => ({
  tenantsAsBaseCurrency: many(tenants, {
    relationName: DRIZZLE_RELATION_NAME.tenantToCurrencyBase,
  }),
  tenantsAsReportingCurrency: many(tenants, {
    relationName: DRIZZLE_RELATION_NAME.tenantToCurrencyReporting,
  }),
  legalEntities: many(legalEntities),
  customers: many(customers),
  suppliers: many(suppliers),
}))

/** BCP 47 locale codes — `mdm.tenants.default_locale_code`, `iam.user_accounts.locale_code`, … */
export const localesRelations = relations(locales, ({ many }) => ({
  tenants: many(tenants),
  tenantLabelOverrides: many(tenantLabelOverrides),
  userAccounts: many(userAccounts),
}))

/** IANA timezone names — `mdm.tenants.default_timezone_name`, `mdm.locations.timezone_name`, … */
export const timezonesRelations = relations(timezones, ({ many }) => ({
  tenants: many(tenants),
  locations: many(locations),
  userAccounts: many(userAccounts),
}))

/** Unit-of-measure codes — `mdm.items.base_uom_code` */
export const uomsRelations = relations(uoms, ({ many }) => ({
  items: many(items),
}))
