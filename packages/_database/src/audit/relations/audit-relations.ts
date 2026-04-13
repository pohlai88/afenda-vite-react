import { relations } from "drizzle-orm"

import { users } from "../../identity/schema/users"
import { legalEntities } from "../../organization/schema/legal-entities"
import { tenants } from "../../tenancy/schema/tenants"
import { auditLogs } from "../schema/audit-logs"

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
  legalEntity: one(legalEntities, {
    fields: [auditLogs.legalEntityId],
    references: [legalEntities.id],
  }),
  parent: one(auditLogs, {
    fields: [auditLogs.parentAuditId],
    references: [auditLogs.id],
    relationName: "audit_log_parent",
  }),
  children: many(auditLogs, { relationName: "audit_log_parent" }),
}))
