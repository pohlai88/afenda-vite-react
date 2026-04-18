/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle `relations()` graphs under `src/relations/` (not `pgTable` DDL).
 * Import via `@afenda/database/relations`; do not deep-import `src/` from apps.
 * Not for browser bundles: server-only Drizzle + `pg`.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `relations/mdm-relations.ts` — MDM `relations()` graph (tenants, parties, items, org tree, item settings, …).
 * Polymorphic `master_aliases` / `external_identities` are not `many()`-linked from `parties`/`items` (no FK); use `tenant_id` lists instead.
 */
import { relations } from "drizzle-orm"

import { DRIZZLE_RELATION_NAME } from "./relation-names"

import { accounts } from "../schema/finance/accounts.schema"
import { fiscalCalendars } from "../schema/finance/fiscal-calendars.schema"
import { legalEntityCoaAssignments } from "../schema/finance/legal-entity-coa-assignments.schema"
import { dataSources } from "../schema/governance/data-sources.schema"
import { countries } from "../schema/ref/countries.schema"
import { currencies } from "../schema/ref/currencies.schema"
import { locales } from "../schema/ref/locales.schema"
import { timezones } from "../schema/ref/timezones.schema"
import { uoms } from "../schema/ref/uoms.schema"
import { businessUnits } from "../schema/mdm/business-units.schema"
import { customers } from "../schema/mdm/customers.schema"
import { customFieldDefinitions } from "../schema/mdm/custom-field-definitions.schema"
import { customFieldValues } from "../schema/mdm/custom-field-values.schema"
import { documentSequences } from "../schema/mdm/document-sequences.schema"
import { externalIdentities } from "../schema/mdm/external-identities.schema"
import { itemCategories } from "../schema/mdm/item-categories.schema"
import { itemEntitySettings } from "../schema/mdm/item-entity-settings.schema"
import { items } from "../schema/mdm/items.schema"
import { legalEntities } from "../schema/mdm/legal-entities.schema"
import { locations } from "../schema/mdm/locations.schema"
import { addresses } from "../schema/mdm/addresses.schema"
import { masterAliases } from "../schema/mdm/master-aliases.schema"
import { orgUnits } from "../schema/mdm/org-units.schema"
import { parties } from "../schema/mdm/parties.schema"
import { partyAddresses } from "../schema/mdm/party-addresses.schema"
import { suppliers } from "../schema/mdm/suppliers.schema"
import { authorityPolicies } from "../schema/iam/authority-policies.schema"
import { tenantLabelOverrides } from "../schema/mdm/tenant-label-overrides.schema"
import { tenantPolicies } from "../schema/mdm/tenant-policies.schema"
import { tenantProfiles } from "../schema/mdm/tenant-profiles.schema"
import { taxRegistrations } from "../schema/mdm/tax-registrations.schema"
import { tenants } from "../schema/mdm/tenants.schema"

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  profile: one(tenantProfiles),
  labelOverrides: many(tenantLabelOverrides),
  policies: many(tenantPolicies),
  documentSequences: many(documentSequences),
  legalEntities: many(legalEntities),
  businessUnits: many(businessUnits),
  locations: many(locations),
  orgUnits: many(orgUnits),
  authorityPolicies: many(authorityPolicies),
  parties: many(parties),
  items: many(items),
  itemCategories: many(itemCategories),
  aliases: many(masterAliases),
  externalIdentities: many(externalIdentities),
  taxRegistrations: many(taxRegistrations),
  customFieldDefinitions: many(customFieldDefinitions),
  customFieldValues: many(customFieldValues),
  legalEntityCoaAssignments: many(legalEntityCoaAssignments),
  partyAddresses: many(partyAddresses),
  country: one(countries, {
    fields: [tenants.countryCode],
    references: [countries.code],
  }),
  baseCurrency: one(currencies, {
    fields: [tenants.baseCurrencyCode],
    references: [currencies.code],
    relationName: DRIZZLE_RELATION_NAME.tenantToCurrencyBase,
  }),
  reportingCurrency: one(currencies, {
    fields: [tenants.reportingCurrencyCode],
    references: [currencies.code],
    relationName: DRIZZLE_RELATION_NAME.tenantToCurrencyReporting,
  }),
  defaultLocale: one(locales, {
    fields: [tenants.defaultLocaleCode],
    references: [locales.code],
  }),
  defaultTimezone: one(timezones, {
    fields: [tenants.defaultTimezoneName],
    references: [timezones.name],
  }),
}))

export const customFieldDefinitionsRelations = relations(
  customFieldDefinitions,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [customFieldDefinitions.tenantId],
      references: [tenants.id],
    }),
    values: many(customFieldValues),
  })
)

export const customFieldValuesRelations = relations(customFieldValues, ({ one }) => ({
  tenant: one(tenants, {
    fields: [customFieldValues.tenantId],
    references: [tenants.id],
  }),
  definition: one(customFieldDefinitions, {
    fields: [customFieldValues.customFieldDefinitionId],
    references: [customFieldDefinitions.id],
  }),
}))

export const tenantPoliciesRelations = relations(tenantPolicies, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantPolicies.tenantId],
    references: [tenants.id],
  }),
}))

export const tenantProfilesRelations = relations(tenantProfiles, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantProfiles.tenantId],
    references: [tenants.id],
  }),
}))

export const tenantLabelOverridesRelations = relations(
  tenantLabelOverrides,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantLabelOverrides.tenantId],
      references: [tenants.id],
    }),
    locale: one(locales, {
      fields: [tenantLabelOverrides.localeCode],
      references: [locales.code],
    }),
  })
)

export const legalEntitiesRelations = relations(
  legalEntities,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [legalEntities.tenantId],
      references: [tenants.id],
    }),
    fiscalCalendar: one(fiscalCalendars, {
      fields: [legalEntities.tenantId, legalEntities.fiscalCalendarId],
      references: [fiscalCalendars.tenantId, fiscalCalendars.id],
    }),
    country: one(countries, {
      fields: [legalEntities.countryCode],
      references: [countries.code],
    }),
    baseCurrency: one(currencies, {
      fields: [legalEntities.baseCurrencyCode],
      references: [currencies.code],
    }),
    documentSequences: many(documentSequences),
    businessUnits: many(businessUnits),
    locations: many(locations),
    orgUnits: many(orgUnits),
    taxRegistrations: many(taxRegistrations),
    legalEntityCoaAssignments: many(legalEntityCoaAssignments),
  })
)

export const taxRegistrationsRelations = relations(
  taxRegistrations,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [taxRegistrations.tenantId],
      references: [tenants.id],
    }),
    legalEntity: one(legalEntities, {
      fields: [taxRegistrations.tenantId, taxRegistrations.legalEntityId],
      references: [legalEntities.tenantId, legalEntities.id],
    }),
    party: one(parties, {
      fields: [taxRegistrations.tenantId, taxRegistrations.partyId],
      references: [parties.tenantId, parties.id],
    }),
    country: one(countries, {
      fields: [taxRegistrations.countryCode],
      references: [countries.code],
    }),
  })
)

export const documentSequencesRelations = relations(
  documentSequences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [documentSequences.tenantId],
      references: [tenants.id],
    }),
    legalEntity: one(legalEntities, {
      fields: [documentSequences.tenantId, documentSequences.legalEntityId],
      references: [legalEntities.tenantId, legalEntities.id],
    }),
  })
)

export const businessUnitsRelations = relations(
  businessUnits,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [businessUnits.tenantId],
      references: [tenants.id],
    }),
    legalEntity: one(legalEntities, {
      fields: [businessUnits.tenantId, businessUnits.legalEntityId],
      references: [legalEntities.tenantId, legalEntities.id],
    }),
    locations: many(locations),
    orgUnits: many(orgUnits),
  })
)

export const locationsRelations = relations(locations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [locations.tenantId],
    references: [tenants.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [locations.tenantId, locations.legalEntityId],
    references: [legalEntities.tenantId, legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [locations.tenantId, locations.businessUnitId],
    references: [businessUnits.tenantId, businessUnits.id],
  }),
  country: one(countries, {
    fields: [locations.countryCode],
    references: [countries.code],
  }),
  timezone: one(timezones, {
    fields: [locations.timezoneName],
    references: [timezones.name],
  }),
  orgUnits: many(orgUnits),
}))

export const orgUnitsRelations = relations(orgUnits, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [orgUnits.tenantId],
    references: [tenants.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [orgUnits.tenantId, orgUnits.legalEntityId],
    references: [legalEntities.tenantId, legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [orgUnits.tenantId, orgUnits.businessUnitId],
    references: [businessUnits.tenantId, businessUnits.id],
  }),
  location: one(locations, {
    fields: [orgUnits.tenantId, orgUnits.locationId],
    references: [locations.tenantId, locations.id],
  }),
  parent: one(orgUnits, {
    fields: [orgUnits.tenantId, orgUnits.parentOrgUnitId],
    references: [orgUnits.tenantId, orgUnits.id],
    relationName: "org_unit_tree",
  }),
  children: many(orgUnits, {
    relationName: "org_unit_tree",
  }),
}))

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [addresses.tenantId],
    references: [tenants.id],
  }),
  partyAddresses: many(partyAddresses),
}))

export const partyAddressesRelations = relations(partyAddresses, ({ one }) => ({
  tenant: one(tenants, {
    fields: [partyAddresses.tenantId],
    references: [tenants.id],
  }),
  party: one(parties, {
    fields: [partyAddresses.tenantId, partyAddresses.partyId],
    references: [parties.tenantId, parties.id],
  }),
  address: one(addresses, {
    fields: [partyAddresses.tenantId, partyAddresses.addressId],
    references: [addresses.tenantId, addresses.id],
  }),
}))

export const partiesRelations = relations(parties, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [parties.tenantId],
    references: [tenants.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [parties.tenantId, parties.legalEntityId],
    references: [legalEntities.tenantId, legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [parties.tenantId, parties.businessUnitId],
    references: [businessUnits.tenantId, businessUnits.id],
  }),
  location: one(locations, {
    fields: [parties.tenantId, parties.locationId],
    references: [locations.tenantId, locations.id],
  }),
  goldenRecord: one(parties, {
    fields: [parties.goldenRecordId],
    references: [parties.id],
    relationName: "party_golden_record",
  }),
  mergedChildren: many(parties, {
    relationName: "party_golden_record",
  }),
  taxRegistrations: many(taxRegistrations),
  partyAddresses: many(partyAddresses),
  customer: one(customers, {
    fields: [parties.tenantId, parties.id],
    references: [customers.tenantId, customers.partyId],
  }),
  supplier: one(suppliers, {
    fields: [parties.tenantId, parties.id],
    references: [suppliers.tenantId, suppliers.partyId],
  }),
  dataSource: one(dataSources, {
    fields: [parties.sourceSystemId],
    references: [dataSources.id],
  }),
}))

export const customersRelations = relations(customers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.id],
  }),
  party: one(parties, {
    fields: [customers.tenantId, customers.partyId],
    references: [parties.tenantId, parties.id],
  }),
  currency: one(currencies, {
    fields: [customers.currencyCode],
    references: [currencies.code],
  }),
}))

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [suppliers.tenantId],
    references: [tenants.id],
  }),
  party: one(parties, {
    fields: [suppliers.tenantId, suppliers.partyId],
    references: [parties.tenantId, parties.id],
  }),
  currency: one(currencies, {
    fields: [suppliers.currencyCode],
    references: [currencies.code],
  }),
}))

export const itemCategoriesRelations = relations(itemCategories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [itemCategories.tenantId],
    references: [tenants.id],
  }),
  items: many(items),
}))

export const itemsRelations = relations(items, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [items.tenantId],
    references: [tenants.id],
  }),
  category: one(itemCategories, {
    fields: [items.tenantId, items.categoryId],
    references: [itemCategories.tenantId, itemCategories.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [items.tenantId, items.legalEntityId],
    references: [legalEntities.tenantId, legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [items.tenantId, items.businessUnitId],
    references: [businessUnits.tenantId, businessUnits.id],
  }),
  location: one(locations, {
    fields: [items.tenantId, items.locationId],
    references: [locations.tenantId, locations.id],
  }),
  baseUom: one(uoms, {
    fields: [items.baseUomCode],
    references: [uoms.code],
  }),
  dataSource: one(dataSources, {
    fields: [items.sourceSystemId],
    references: [dataSources.id],
  }),
  entitySettings: many(itemEntitySettings),
}))

export const itemEntitySettingsRelations = relations(
  itemEntitySettings,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [itemEntitySettings.tenantId],
      references: [tenants.id],
    }),
    item: one(items, {
      fields: [itemEntitySettings.tenantId, itemEntitySettings.itemId],
      references: [items.tenantId, items.id],
    }),
    legalEntity: one(legalEntities, {
      fields: [itemEntitySettings.tenantId, itemEntitySettings.legalEntityId],
      references: [legalEntities.tenantId, legalEntities.id],
    }),
    businessUnit: one(businessUnits, {
      fields: [itemEntitySettings.tenantId, itemEntitySettings.businessUnitId],
      references: [businessUnits.tenantId, businessUnits.id],
    }),
    location: one(locations, {
      fields: [itemEntitySettings.tenantId, itemEntitySettings.locationId],
      references: [locations.tenantId, locations.id],
    }),
    salesAccount: one(accounts, {
      fields: [itemEntitySettings.tenantId, itemEntitySettings.salesAccountId],
      references: [accounts.tenantId, accounts.id],
      relationName: "sales_account_item_settings",
    }),
    inventoryAccount: one(accounts, {
      fields: [
        itemEntitySettings.tenantId,
        itemEntitySettings.inventoryAccountId,
      ],
      references: [accounts.tenantId, accounts.id],
      relationName: "inventory_account_item_settings",
    }),
    cogsAccount: one(accounts, {
      fields: [itemEntitySettings.tenantId, itemEntitySettings.cogsAccountId],
      references: [accounts.tenantId, accounts.id],
      relationName: "cogs_account_item_settings",
    }),
  })
)

export const masterAliasesRelations = relations(masterAliases, ({ one }) => ({
  tenant: one(tenants, {
    fields: [masterAliases.tenantId],
    references: [tenants.id],
  }),
  dataSource: one(dataSources, {
    fields: [masterAliases.sourceSystemId],
    references: [dataSources.id],
  }),
}))

export const externalIdentitiesRelations = relations(
  externalIdentities,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [externalIdentities.tenantId],
      references: [tenants.id],
    }),
    dataSource: one(dataSources, {
      fields: [externalIdentities.sourceSystemId],
      references: [dataSources.id],
    }),
  })
)
