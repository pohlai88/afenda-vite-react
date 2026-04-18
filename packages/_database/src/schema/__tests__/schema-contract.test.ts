import { describe, expect, it } from "vitest"

import { auditLogs } from "../../7w1h-audit/audit-logs.schema"
import { authChallenges } from "../iam/auth-challenges.schema"
import { authorityPolicies } from "../iam/authority-policies.schema"
import { identityLinks } from "../iam/identity-links.schema"
import { persons } from "../iam/persons.schema"
import { tenantMemberships } from "../iam/tenant-memberships.schema"
import { tenantRoleAssignments } from "../iam/tenant-role-assignments.schema"
import { tenantRoles } from "../iam/tenant-roles.schema"
import { userAccounts } from "../iam/user-accounts.schema"
import { userIdentities } from "../iam/user-identities.schema"
import { fiscalPeriods } from "../finance/fiscal-periods.schema"
import { legalEntityCoaAssignments } from "../finance/legal-entity-coa-assignments.schema"
import { customFieldDefinitions } from "../mdm/custom-field-definitions.schema"
import { customFieldValues } from "../mdm/custom-field-values.schema"
import { documentSequences } from "../mdm/document-sequences.schema"
import { externalIdentities } from "../mdm/external-identities.schema"
import { legalEntities } from "../mdm/legal-entities.schema"
import { masterAliases } from "../mdm/master-aliases.schema"
import { parties } from "../mdm/parties.schema"
import { orgUnits } from "../mdm/org-units.schema"
import { partyAddresses } from "../mdm/party-addresses.schema"
import { taxRegistrations } from "../mdm/tax-registrations.schema"
import { tenantLabelOverrides } from "../mdm/tenant-label-overrides.schema"
import { tenantPolicies } from "../mdm/tenant-policies.schema"
import { tenantProfiles } from "../mdm/tenant-profiles.schema"
import { tenants } from "../mdm/tenants.schema"

describe("guideline schema contract (tables)", () => {
  it("scopes MDM tenant root and IAM memberships", () => {
    expect(tenants.id.name).toBe("id")
    expect(tenants.tenantCode.name).toBe("tenant_code")
    expect(tenants.tenantName.name).toBe("tenant_name")
    expect(legalEntities.tenantId.name).toBe("tenant_id")
    expect(parties.partyCode.name).toBe("party_code")
    expect(tenantMemberships.tenantId.name).toBe("tenant_id")
    expect(tenantMemberships.userAccountId.name).toBe("user_account_id")
  })

  it("keeps the identity bridge explicit", () => {
    expect(userAccounts.email.name).toBe("email")
    expect(identityLinks.afendaUserId.name).toBe("afenda_user_id")
    expect(identityLinks.betterAuthUserId.name).toBe("better_auth_user_id")
    expect(userIdentities.provider.name).toBe("provider")
  })

  it("keeps persons and membership person link columns stable (no envelope modules)", () => {
    expect(persons.fullName.name).toBe("full_name")
    expect(persons.primaryEmail.name).toBe("primary_email")
    expect(persons.metadata.name).toBe("metadata")
    expect(tenantMemberships.personId.name).toBe("person_id")
  })

  it("keeps auth challenges in the canonical schema barrel", () => {
    expect(authChallenges.challengeId.name).toBe("challenge_id")
  })

  it("keeps audit append-only and tenant scoped", () => {
    expect(auditLogs.tenantId.name).toBe("tenant_id")
    expect(auditLogs.recordedAt.name).toBe("created_at")
    expect(auditLogs.sevenW1h.name).toBe("seven_w1h")
    expect("updatedAt" in auditLogs).toBe(false)
    expect("deletedAt" in auditLogs).toBe(false)
  })

  it("keeps version_no on mutable tables wired in patch_a_triggers.sql", () => {
    const versioned = [
      tenantProfiles,
      tenantLabelOverrides,
      tenantPolicies,
      orgUnits,
      documentSequences,
      masterAliases,
      externalIdentities,
      customFieldDefinitions,
      customFieldValues,
      partyAddresses,
      taxRegistrations,
      authorityPolicies,
      tenantRoles,
      tenantRoleAssignments,
      legalEntityCoaAssignments,
      fiscalPeriods,
    ] as const
    for (const t of versioned) {
      expect("versionNo" in t).toBe(true)
      expect(t.versionNo.name).toBe("version_no")
    }
    expect(userIdentities.updatedAt.name).toBe("updated_at")
    expect("versionNo" in userIdentities).toBe(false)
  })
})
