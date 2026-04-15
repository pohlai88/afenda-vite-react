import { relations } from "drizzle-orm"

import { auditLogs } from "../../audit/schema/audit-logs"
import { tenantInvitations } from "../../authorization/schema/tenant-invitations"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
import { identityLinks } from "../schema/identity-links"
import { userIdentities } from "../schema/user-identities"
import { users } from "../schema/users"

export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
  /** @deprecated Prefer `identityLinks`; see deprecated `user_identities` schema. */
  legacyUserIdentities: many(userIdentities),
  identityLinks: many(identityLinks),
  invitationsSent: many(tenantInvitations),
  memberships: many(tenantMemberships),
}))

export const userIdentitiesRelations = relations(userIdentities, ({ one }) => ({
  user: one(users, {
    fields: [userIdentities.userId],
    references: [users.id],
  }),
}))

export const identityLinksRelations = relations(identityLinks, ({ one }) => ({
  user: one(users, {
    fields: [identityLinks.afendaUserId],
    references: [users.id],
  }),
}))
