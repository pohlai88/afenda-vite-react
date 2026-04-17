import { relations } from "drizzle-orm"

import { auditLogs } from "../../audit/schema/audit-logs.schema"
import { users } from "../../identity/schema/users.schema"
import { tenantMemberships } from "../schema/tenant-memberships.schema"
import { tenants } from "../schema/tenants.schema"

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  auditLogs: many(auditLogs),
  memberships: many(tenantMemberships),
  owner: one(users, {
    fields: [tenants.ownerUserId],
    references: [users.id],
  }),
}))

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ many, one }) => ({
    auditLogs: many(auditLogs),
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
    user: one(users, {
      fields: [tenantMemberships.userId],
      references: [users.id],
      relationName: "tenant_membership_user",
    }),
    invitedBy: one(users, {
      fields: [tenantMemberships.invitedByUserId],
      references: [users.id],
      relationName: "tenant_membership_invited_by",
    }),
  })
)
