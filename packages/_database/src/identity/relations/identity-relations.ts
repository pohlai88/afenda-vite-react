import { relations } from "drizzle-orm"

import { auditLogs } from "../../audit/schema/audit-logs"
import { tenantInvitations } from "../../authorization/schema/tenant-invitations"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
import { userIdentities } from "../schema/user-identities"
import { users } from "../schema/users"

export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
  identities: many(userIdentities),
  invitationsSent: many(tenantInvitations),
  memberships: many(tenantMemberships),
}))

export const userIdentitiesRelations = relations(userIdentities, ({ one }) => ({
  user: one(users, {
    fields: [userIdentities.userId],
    references: [users.id],
  }),
}))
