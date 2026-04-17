import { describe, expect, it } from "vitest"

import { auditLogs } from "../../audit/schema/audit-logs.schema"
import { membershipLegalEntityScopes } from "../../authorization/schema/membership-legal-entity-scopes.schema"
import { permissions } from "../../authorization/schema/permissions.schema"
import { rolePermissions } from "../../authorization/schema/role-permissions.schema"
import { roles } from "../../authorization/schema/roles.schema"
import { tenantMembershipRoles } from "../../authorization/schema/tenant-membership-roles.schema"
import { identityLinks } from "../../identity/schema/identity-links.schema"
import { userIdentities } from "../../identity/schema/user-identities.schema"
import { users } from "../../identity/schema/users.schema"
import { legalEntities } from "../../organization/schema/legal-entities.schema"
import { orgUnits } from "../../organization/schema/org-units.schema"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships.schema"
import { tenants } from "../../tenancy/schema/tenants.schema"

describe("domain schema contract", () => {
  it("keeps tenant-owned tables explicitly tenant scoped", () => {
    expect(tenantMemberships.tenantId.name).toBe("tenant_id")
    expect(roles.tenantId.name).toBe("tenant_id")
    expect(legalEntities.tenantId.name).toBe("tenant_id")
    expect(orgUnits.tenantId.name).toBe("tenant_id")
    expect(auditLogs.tenantId.name).toBe("tenant_id")
  })

  it("keeps authorization scope assignment in the authorization domain", () => {
    expect(membershipLegalEntityScopes.tenantId.name).toBe("tenant_id")
    expect(membershipLegalEntityScopes.membershipId.name).toBe("membership_id")
    expect(membershipLegalEntityScopes.legalEntityId.name).toBe(
      "legal_entity_id"
    )
  })

  it("supports multiple roles per tenant membership", () => {
    expect(tenantMembershipRoles.tenantId.name).toBe("tenant_id")
    expect(tenantMembershipRoles.membershipId.name).toBe("membership_id")
    expect(tenantMembershipRoles.roleId.name).toBe("role_id")
  })

  it("keeps role permissions many-to-many and globally keyed permissions", () => {
    expect(permissions.key.name).toBe("key")
    expect(rolePermissions.roleId.name).toBe("role_id")
    expect(rolePermissions.permissionId.name).toBe("permission_id")
  })

  it("keeps the canonical auth bridge on identity_links (legacy user_identities is deprecated)", () => {
    expect(users.email.name).toBe("email")
    expect(identityLinks.afendaUserId.name).toBe("afenda_user_id")
    expect(identityLinks.betterAuthUserId.name).toBe("better_auth_user_id")
    expect(identityLinks.authProvider.name).toBe("auth_provider")
    expect(userIdentities.provider.name).toBe("provider")
    expect(userIdentities.providerSubject.name).toBe("provider_subject")
  })

  it("keeps audit append-only by omitting update and delete lifecycle columns", () => {
    expect(auditLogs.recordedAt.name).toBe("created_at")
    expect(auditLogs.subjectType.name).toBe("entity_type")
    expect(auditLogs.occurredAt.name).toBe("occurred_at")
    expect("updatedAt" in auditLogs).toBe(false)
    expect("deletedAt" in auditLogs).toBe(false)
  })

  it("keeps organization structural truth in organization tables", () => {
    expect(tenants.id.name).toBe("id")
    expect(legalEntities.code.name).toBe("code")
    expect(orgUnits.parentOrgUnitId.name).toBe("parent_org_unit_id")
  })
})
