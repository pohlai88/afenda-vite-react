/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle `relations()` graphs under `src/relations/` (not `pgTable` DDL).
 * Import via `@afenda/database/relations` or merged `afendaDrizzleSchema` in `client.ts`; do not deep-import `src/` from apps.
 * Not for browser bundles: relations ship with the Drizzle client on Node `pg` only.
 * FK and composite key patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `relations/relations.schema.ts` — central barrel: domain `*-relations.ts` re-exports + `auditLogsRelations`.
 * Disambiguated names: `./relation-names.ts` (`DRIZZLE_RELATION_NAME`). Filename `*.schema.ts` here is a known exception (DDL suffix reserved under `src/schema/`); see `008-db-tree.md`.
 */
import { relations } from "drizzle-orm"

import { auditLogs } from "../7w1h-audit/audit-logs.schema"
import { tenantMemberships } from "../schema/iam/tenant-memberships.schema"
import { userAccounts } from "../schema/iam/user-accounts.schema"
import { tenants } from "../schema/mdm/tenants.schema"

export { dataSourcesRelations } from "./governance-relations"

export {
  DRIZZLE_RELATION_NAME,
  type DrizzleDisambiguatedRelationName,
} from "./relation-names"

export {
  accountsRelations,
  chartOfAccountSetsRelations,
  fiscalCalendarsRelations,
  fiscalPeriodsRelations,
  legalEntityCoaAssignmentsRelations,
} from "./finance-relations"

export {
  countriesRelations,
  currenciesRelations,
  localesRelations,
  timezonesRelations,
  uomsRelations,
} from "./ref-relations"

export {
  authChallengesRelations,
  authorityPoliciesRelations,
  identityLinksRelations,
  personsRelations,
  tenantMembershipsRelations,
  tenantRoleAssignmentsRelations,
  tenantRolesRelations,
  userAccountsRelations,
  userIdentitiesRelations,
} from "./iam-relations"

export {
  addressesRelations,
  businessUnitsRelations,
  customFieldDefinitionsRelations,
  customFieldValuesRelations,
  customersRelations,
  documentSequencesRelations,
  externalIdentitiesRelations,
  itemCategoriesRelations,
  itemEntitySettingsRelations,
  itemsRelations,
  legalEntitiesRelations,
  locationsRelations,
  masterAliasesRelations,
  orgUnitsRelations,
  partiesRelations,
  partyAddressesRelations,
  suppliersRelations,
  tenantLabelOverridesRelations,
  tenantPoliciesRelations,
  tenantProfilesRelations,
  taxRegistrationsRelations,
  tenantsRelations,
} from "./mdm-relations"

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
  membership: one(tenantMemberships, {
    fields: [auditLogs.tenantId, auditLogs.membershipId],
    references: [tenantMemberships.tenantId, tenantMemberships.id],
  }),
  actorUser: one(userAccounts, {
    fields: [auditLogs.actorUserId],
    references: [userAccounts.id],
  }),
  actingAsUser: one(userAccounts, {
    fields: [auditLogs.actingAsUserId],
    references: [userAccounts.id],
  }),
}))
