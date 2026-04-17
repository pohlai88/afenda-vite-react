import { relations } from "drizzle-orm"

import { users } from "../../identity/schema/users.schema"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships.schema"
import { tenants } from "../../tenancy/schema/tenants.schema"
import { auditLogs } from "../schema/audit-logs.schema"

export const auditLogsRelations = relations(auditLogs, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),

  actorUser: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
    relationName: "audit_actor_user",
  }),

  actingAsUser: one(users, {
    fields: [auditLogs.actingAsUserId],
    references: [users.id],
    relationName: "audit_acting_as_user",
  }),

  membership: one(tenantMemberships, {
    fields: [auditLogs.membershipId, auditLogs.tenantId],
    references: [tenantMemberships.id, tenantMemberships.tenantId],
  }),

  parent: one(auditLogs, {
    fields: [auditLogs.parentAuditId],
    references: [auditLogs.id],
    relationName: "audit_log_parent",
  }),

  children: many(auditLogs, { relationName: "audit_log_parent" }),
}))
