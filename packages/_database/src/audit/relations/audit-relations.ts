import { relations } from "drizzle-orm"

import { users } from "../../identity/schema/users"
import { businessUnits } from "../../organization/schema/business-units"
import { legalEntities } from "../../organization/schema/legal-entities"
import { locations } from "../../organization/schema/locations"
import { orgUnits } from "../../organization/schema/org-units"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
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
  membership: one(tenantMemberships, {
    fields: [auditLogs.membershipId, auditLogs.tenantId],
    references: [tenantMemberships.id, tenantMemberships.tenantId],
  }),
  legalEntity: one(legalEntities, {
    fields: [auditLogs.legalEntityId, auditLogs.tenantId],
    references: [legalEntities.id, legalEntities.tenantId],
  }),
  businessUnit: one(businessUnits, {
    fields: [auditLogs.businessUnitId, auditLogs.tenantId],
    references: [businessUnits.id, businessUnits.tenantId],
  }),
  location: one(locations, {
    fields: [auditLogs.locationId, auditLogs.tenantId],
    references: [locations.id, locations.tenantId],
  }),
  orgUnit: one(orgUnits, {
    fields: [auditLogs.orgUnitId, auditLogs.tenantId],
    references: [orgUnits.id, orgUnits.tenantId],
  }),
  parent: one(auditLogs, {
    fields: [auditLogs.parentAuditId],
    references: [auditLogs.id],
    relationName: "audit_log_parent",
  }),
  children: many(auditLogs, { relationName: "audit_log_parent" }),
}))
