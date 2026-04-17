import { describe, expect, it } from "vitest"

import { auditLogs } from "../../audit/schema/audit-logs.schema"
import { identityLinks } from "../../identity/schema/identity-links.schema"
import { userIdentities } from "../../identity/schema/user-identities.schema"
import { users } from "../../identity/schema/users.schema"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships.schema"
import { tenants } from "../../tenancy/schema/tenants.schema"

describe("domain schema contract", () => {
  it("keeps tenant-owned tables explicitly tenant scoped", () => {
    expect(tenantMemberships.tenantId.name).toBe("tenant_id")
    expect(auditLogs.tenantId.name).toBe("tenant_id")
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

  it("keeps the tenant root minimal and membership-based", () => {
    expect(tenants.id.name).toBe("id")
    expect(tenants.code.name).toBe("code")
    expect(tenantMemberships.userId.name).toBe("user_id")
    expect(tenantMemberships.tenantId.name).toBe("tenant_id")
  })
})
