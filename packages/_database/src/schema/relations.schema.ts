import { relations } from "drizzle-orm"

import { auditLogs } from "./governance/audit-logs.schema"
import { authChallenges } from "./iam/auth-challenges.schema"
import { identityLinks } from "./iam/identity-links.schema"
import { tenantMemberships } from "./iam/tenant-memberships.schema"
import { userAccounts } from "./iam/user-accounts.schema"
import { userIdentities } from "./iam/user-identities.schema"
import { tenants } from "./mdm/tenants.schema"

export const userAccountsRelations = relations(userAccounts, ({ many }) => ({
  identityLinks: many(identityLinks),
  userIdentities: many(userIdentities),
  tenantMemberships: many(tenantMemberships),
}))

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

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  memberships: many(tenantMemberships),
  owner: one(userAccounts, {
    fields: [tenants.ownerUserId],
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
      fields: [tenantMemberships.userId],
      references: [userAccounts.id],
    }),
    auditLogs: many(auditLogs),
  })
)

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

/** Auth challenges are standalone rows (no FK to user_accounts in schema). */
export const authChallengesRelations = relations(authChallenges, () => ({}))
