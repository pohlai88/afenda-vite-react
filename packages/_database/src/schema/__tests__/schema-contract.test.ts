import { describe, expect, it } from "vitest"

import { auditLogs } from "../governance/audit-logs.schema"
import { authChallenges } from "../iam/auth-challenges.schema"
import { identityLinks } from "../iam/identity-links.schema"
import { tenantMemberships } from "../iam/tenant-memberships.schema"
import { userAccounts } from "../iam/user-accounts.schema"
import { userIdentities } from "../iam/user-identities.schema"
import { tenants } from "../mdm/tenants.schema"

describe("guideline schema contract", () => {
  it("scopes MDM tenant root and IAM memberships", () => {
    expect(tenants.id.name).toBe("id")
    expect(tenants.code.name).toBe("code")
    expect(tenantMemberships.tenantId.name).toBe("tenant_id")
    expect(tenantMemberships.userId.name).toBe("user_id")
  })

  it("keeps the identity bridge explicit", () => {
    expect(userAccounts.email.name).toBe("email")
    expect(identityLinks.afendaUserId.name).toBe("afenda_user_id")
    expect(identityLinks.betterAuthUserId.name).toBe("better_auth_user_id")
    expect(userIdentities.provider.name).toBe("provider")
  })

  it("keeps auth challenges in the canonical schema barrel", () => {
    expect(authChallenges.challengeId.name).toBe("challenge_id")
  })

  it("keeps audit append-only and tenant scoped", () => {
    expect(auditLogs.tenantId.name).toBe("tenant_id")
    expect(auditLogs.recordedAt.name).toBe("created_at")
    expect("updatedAt" in auditLogs).toBe(false)
    expect("deletedAt" in auditLogs).toBe(false)
  })
})
