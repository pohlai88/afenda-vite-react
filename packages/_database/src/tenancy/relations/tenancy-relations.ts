import { relations } from "drizzle-orm"

import { auditLogs } from "../../audit/schema/audit-logs"
import { membershipLegalEntityScopes } from "../../authorization/schema/membership-legal-entity-scopes"
import { membershipOrgUnitScopes } from "../../authorization/schema/membership-org-unit-scopes"
import { membershipScopes } from "../../authorization/schema/membership-scopes"
import { roles } from "../../authorization/schema/roles"
import { tenantMembershipRoles } from "../../authorization/schema/tenant-membership-roles"
import { users } from "../../identity/schema/users"
import { businessUnits } from "../../organization/schema/business-units"
import { legalEntities } from "../../organization/schema/legal-entities"
import { locations } from "../../organization/schema/locations"
import { orgUnits } from "../../organization/schema/org-units"
import { tenantMemberships } from "../schema/tenant-memberships"
import { tenantSettings } from "../schema/tenant-settings"
import { tenants } from "../schema/tenants"

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  auditLogs: many(auditLogs),
  legalEntities: many(legalEntities),
  memberships: many(tenantMemberships),
  orgUnits: many(orgUnits),
  businessUnits: many(businessUnits),
  locations: many(locations),
  roles: many(roles),
  settings: one(tenantSettings, {
    fields: [tenants.id],
    references: [tenantSettings.tenantId],
  }),
  owner: one(users, {
    fields: [tenants.ownerUserId],
    references: [users.id],
  }),
}))

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ many, one }) => ({
    roles: many(tenantMembershipRoles),
    membershipScopes: many(membershipScopes),
    /** @deprecated Prefer `membershipScopes` with appropriate `scope_type`. */
    legacyLegalEntityScopes: many(membershipLegalEntityScopes),
    /** @deprecated Prefer `membershipScopes` with `scope_type = 'org_unit'`. */
    legacyOrgUnitScopes: many(membershipOrgUnitScopes),
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
