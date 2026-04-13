import { relations } from "drizzle-orm"

import { auditLogs } from "../../audit/schema/audit-logs"
import { roles } from "../../authorization/schema/roles"
import { tenantMembershipRoles } from "../../authorization/schema/tenant-membership-roles"
import { users } from "../../identity/schema/users"
import { legalEntities } from "../../organization/schema/legal-entities"
import { orgUnits } from "../../organization/schema/org-units"
import { tenantMemberships } from "../schema/tenant-memberships"
import { tenants } from "../schema/tenants"

export const tenantsRelations = relations(tenants, ({ many }) => ({
  auditLogs: many(auditLogs),
  legalEntities: many(legalEntities),
  memberships: many(tenantMemberships),
  orgUnits: many(orgUnits),
  roles: many(roles),
}))

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ many, one }) => ({
    roles: many(tenantMembershipRoles),
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
    user: one(users, {
      fields: [tenantMemberships.userId],
      references: [users.id],
    }),
  })
)
