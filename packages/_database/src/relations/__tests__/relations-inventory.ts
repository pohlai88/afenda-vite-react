/**
 * Canonical inventory for `src/relations` — every `relations()` graph exported from `relations.schema.ts`.
 * Update when adding/removing `export const *Relations` in domain files.
 *
 * ## Features (F1–F5)
 *
 * - **F1** `DRIZZLE_RELATION_NAME` — disambiguated `relationName` strings (multi-FK to same table)
 * - **F2** Finance graph (`accounts`, COA, fiscal periods, …)
 * - **F3** Governance graph (`data_sources`)
 * - **F4** IAM graph (users, memberships, roles, …)
 * - **F5** MDM + ref inverse graphs + `auditLogsRelations` anchor
 *
 * ## Runtime exports
 *
 * - **1** constant object: `DRIZZLE_RELATION_NAME`
 * - **45** Drizzle relation graphs: `*Relations` (including `auditLogsRelations`)
 */
export const RELATIONS_GRAPH_EXPORT_NAMES = [
  "auditLogsRelations",
  "dataSourcesRelations",
  "accountsRelations",
  "chartOfAccountSetsRelations",
  "fiscalCalendarsRelations",
  "fiscalPeriodsRelations",
  "invoiceItemsRelations",
  "invoicesRelations",
  "legalEntityCoaAssignmentsRelations",
  "countriesRelations",
  "currenciesRelations",
  "localesRelations",
  "timezonesRelations",
  "uomsRelations",
  "authChallengesRelations",
  "authorityPoliciesRelations",
  "identityLinksRelations",
  "personsRelations",
  "tenantMembershipsRelations",
  "tenantRoleAssignmentsRelations",
  "tenantRolesRelations",
  "userAccountsRelations",
  "userIdentitiesRelations",
  "addressesRelations",
  "businessUnitsRelations",
  "customFieldDefinitionsRelations",
  "customFieldValuesRelations",
  "customersRelations",
  "documentSequencesRelations",
  "externalIdentitiesRelations",
  "itemCategoriesRelations",
  "itemEntitySettingsRelations",
  "itemsRelations",
  "legalEntitiesRelations",
  "locationsRelations",
  "masterAliasesRelations",
  "orgUnitsRelations",
  "partiesRelations",
  "partyAddressesRelations",
  "suppliersRelations",
  "tenantLabelOverridesRelations",
  "tenantPoliciesRelations",
  "tenantProfilesRelations",
  "taxRegistrationsRelations",
  "tenantsRelations",
] as const

export const EXPECTED_RELATIONS_GRAPH_COUNT =
  RELATIONS_GRAPH_EXPORT_NAMES.length

export const RELATIONS_FEATURE_COUNT = 5
