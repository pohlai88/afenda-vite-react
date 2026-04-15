import { relations } from "drizzle-orm"

import { legalEntities } from "../../organization/schema/legal-entities"
import { orgUnits } from "../../organization/schema/org-units"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
import { tenants } from "../../tenancy/schema/tenants"
import { membershipLegalEntityScopes } from "../schema/membership-legal-entity-scopes"
import { membershipOrgUnitScopes } from "../schema/membership-org-unit-scopes"
import { membershipScopes } from "../schema/membership-scopes"
import { permissions } from "../schema/permissions"
import { rolePermissions } from "../schema/role-permissions"
import { roles } from "../schema/roles"
import { tenantInvitations } from "../schema/tenant-invitations"
import { tenantMembershipRoles } from "../schema/tenant-membership-roles"

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

export const rolesRelations = relations(roles, ({ many, one }) => ({
  membershipRoles: many(tenantMembershipRoles),
  permissions: many(rolePermissions),
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
}))

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
  })
)

export const tenantMembershipRolesRelations = relations(
  tenantMembershipRoles,
  ({ one }) => ({
    membership: one(tenantMemberships, {
      fields: [tenantMembershipRoles.membershipId],
      references: [tenantMemberships.id],
    }),
    role: one(roles, {
      fields: [tenantMembershipRoles.roleId],
      references: [roles.id],
    }),
  })
)

export const tenantInvitationsRelations = relations(
  tenantInvitations,
  ({ one }) => ({
    acceptedMembership: one(tenantMemberships, {
      fields: [tenantInvitations.acceptedMembershipId],
      references: [tenantMemberships.id],
    }),
    tenant: one(tenants, {
      fields: [tenantInvitations.tenantId],
      references: [tenants.id],
    }),
  })
)

export const membershipLegalEntityScopesRelations = relations(
  membershipLegalEntityScopes,
  ({ one }) => ({
    legalEntity: one(legalEntities, {
      fields: [membershipLegalEntityScopes.legalEntityId],
      references: [legalEntities.id],
    }),
    membership: one(tenantMemberships, {
      fields: [membershipLegalEntityScopes.membershipId],
      references: [tenantMemberships.id],
    }),
  })
)

export const membershipOrgUnitScopesRelations = relations(
  membershipOrgUnitScopes,
  ({ one }) => ({
    membership: one(tenantMemberships, {
      fields: [membershipOrgUnitScopes.membershipId],
      references: [tenantMemberships.id],
    }),
    orgUnit: one(orgUnits, {
      fields: [membershipOrgUnitScopes.orgUnitId],
      references: [orgUnits.id],
    }),
  })
)

export const membershipScopesRelations = relations(
  membershipScopes,
  ({ one }) => ({
    membership: one(tenantMemberships, {
      fields: [membershipScopes.membershipId, membershipScopes.tenantId],
      references: [tenantMemberships.id, tenantMemberships.tenantId],
    }),
    tenant: one(tenants, {
      fields: [membershipScopes.tenantId],
      references: [tenants.id],
    }),
  })
)
