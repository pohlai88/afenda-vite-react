import { relations } from "drizzle-orm"

import { auditLogs } from "../../audit/schema/audit-logs.schema"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships.schema"
import { identityLinks } from "../schema/identity-links.schema"
import { userIdentities } from "../schema/user-identities.schema"
import { users } from "../schema/users.schema"

export const usersRelations = relations(users, ({ many }) => ({
  auditLogsAsActor: many(auditLogs, { relationName: "audit_actor_user" }),
  auditLogsAsActingAs: many(auditLogs, {
    relationName: "audit_acting_as_user",
  }),
  /** @deprecated Prefer `identityLinks`; see deprecated `user_identities` schema. */
  legacyUserIdentities: many(userIdentities),
  identityLinks: many(identityLinks),
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
