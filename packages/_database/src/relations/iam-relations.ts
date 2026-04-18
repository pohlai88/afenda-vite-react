/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle `relations()` graphs under `src/relations/` (not `pgTable` DDL).
 * Import via `@afenda/database/relations` or the merged client schema; do not deep-import `src/` from apps.
 * Not for browser bundles: relations are server-only with Drizzle + `pg`.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `relations/iam-relations.ts` — IAM `relations()` graph (identity, memberships, roles, assignments, audit reverse edges).
 * `authorityPolicies.role` ↔ composite `(tenant_id, tenant_role_id)`; `tenantMemberships.auditLogs` ↔ `auditLogsRelations` in `relations.schema.ts`.
 */
import { relations } from "drizzle-orm"

import { auditLogs } from "../7w1h-audit/audit-logs.schema"
import { authorityPolicies } from "../schema/iam/authority-policies.schema"
import { authChallenges } from "../schema/iam/auth-challenges.schema"
import { identityLinks } from "../schema/iam/identity-links.schema"
import { persons } from "../schema/iam/persons.schema"
import { tenantMemberships } from "../schema/iam/tenant-memberships.schema"
import { tenantRoleAssignments } from "../schema/iam/tenant-role-assignments.schema"
import { tenantRoles } from "../schema/iam/tenant-roles.schema"
import { userAccounts } from "../schema/iam/user-accounts.schema"
import { userIdentities } from "../schema/iam/user-identities.schema"
import { businessUnits } from "../schema/mdm/business-units.schema"
import { legalEntities } from "../schema/mdm/legal-entities.schema"
import { locations } from "../schema/mdm/locations.schema"
import { tenants } from "../schema/mdm/tenants.schema"
import { locales } from "../schema/ref/locales.schema"
import { timezones } from "../schema/ref/timezones.schema"

export const userAccountsRelations = relations(
  userAccounts,
  ({ many, one }) => ({
    identityLinks: many(identityLinks),
    userIdentities: many(userIdentities),
    tenantMemberships: many(tenantMemberships),
    locale: one(locales, {
      fields: [userAccounts.localeCode],
      references: [locales.code],
    }),
    timezone: one(timezones, {
      fields: [userAccounts.timezoneName],
      references: [timezones.name],
    }),
  })
)

export const identityLinksRelations = relations(identityLinks, ({ one }) => ({
  userAccount: one(userAccounts, {
    fields: [identityLinks.afendaUserId],
    references: [userAccounts.id],
  }),
}))

export const userIdentitiesRelations = relations(userIdentities, ({ one }) => ({
  userAccount: one(userAccounts, {
    fields: [userIdentities.userId],
    references: [userAccounts.id],
  }),
}))

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
    userAccount: one(userAccounts, {
      fields: [tenantMemberships.userAccountId],
      references: [userAccounts.id],
    }),
    person: one(persons, {
      fields: [tenantMemberships.personId],
      references: [persons.id],
    }),
    defaultLegalEntity: one(legalEntities, {
      fields: [
        tenantMemberships.tenantId,
        tenantMemberships.defaultLegalEntityId,
      ],
      references: [legalEntities.tenantId, legalEntities.id],
    }),
    defaultBusinessUnit: one(businessUnits, {
      fields: [
        tenantMemberships.tenantId,
        tenantMemberships.defaultBusinessUnitId,
      ],
      references: [businessUnits.tenantId, businessUnits.id],
    }),
    defaultLocation: one(locations, {
      fields: [tenantMemberships.tenantId, tenantMemberships.defaultLocationId],
      references: [locations.tenantId, locations.id],
    }),
    roleAssignments: many(tenantRoleAssignments),
    auditLogs: many(auditLogs),
  })
)

export const tenantRolesRelations = relations(tenantRoles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [tenantRoles.tenantId],
    references: [tenants.id],
  }),
  assignments: many(tenantRoleAssignments),
  authorityPolicies: many(authorityPolicies),
}))

export const authorityPoliciesRelations = relations(
  authorityPolicies,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [authorityPolicies.tenantId],
      references: [tenants.id],
    }),
    role: one(tenantRoles, {
      fields: [authorityPolicies.tenantId, authorityPolicies.tenantRoleId],
      references: [tenantRoles.tenantId, tenantRoles.id],
    }),
  })
)

export const tenantRoleAssignmentsRelations = relations(
  tenantRoleAssignments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantRoleAssignments.tenantId],
      references: [tenants.id],
    }),
    membership: one(tenantMemberships, {
      fields: [
        tenantRoleAssignments.tenantId,
        tenantRoleAssignments.tenantMembershipId,
      ],
      references: [tenantMemberships.tenantId, tenantMemberships.id],
    }),
    role: one(tenantRoles, {
      fields: [
        tenantRoleAssignments.tenantId,
        tenantRoleAssignments.tenantRoleId,
      ],
      references: [tenantRoles.tenantId, tenantRoles.id],
    }),
  })
)

export const personsRelations = relations(persons, ({ many }) => ({
  tenantMemberships: many(tenantMemberships),
}))

/** Auth challenges are standalone rows (no FK to user_accounts in schema). */
export const authChallengesRelations = relations(authChallenges, () => ({}))
