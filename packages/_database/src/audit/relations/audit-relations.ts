import { relations } from "drizzle-orm"

import { users } from "../../identity/schema/users"
import { tenants } from "../../tenancy/schema/tenants"
import { auditLogs } from "../schema/audit-logs"

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
}))
