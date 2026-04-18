/**
 * Vitest: `iam-boundary.schema.ts` — Zod insert contracts (see module annotation envelope).
 */
import { describe, expect, it } from "vitest"

import {
  iamAuthorityPolicyInsertSchema,
  iamTenantMembershipInsertSchema,
  iamTenantRoleAssignmentInsertSchema,
  iamTenantRoleInsertSchema,
} from "../iam-boundary.schema"

const tid = "018f1234-5678-7abc-8def-123456789abc"
const uid = "028f1234-5678-7abc-8def-123456789abc"
const rid = "038f1234-5678-7abc-8def-123456789abc"
const mid = "048f1234-5678-7abc-8def-123456789abc"

describe("iam-boundary.schema", () => {
  it("accepts a valid tenant role row", () => {
    const row = {
      tenantId: tid,
      roleCode: "finance_admin",
      roleName: "Finance Admin",
      roleCategory: "finance" as const,
    }
    expect(iamTenantRoleInsertSchema.safeParse(row).success).toBe(true)
  })

  it("accepts a valid tenant membership row", () => {
    const row = {
      tenantId: tid,
      userAccountId: uid,
      membershipStatus: "active" as const,
      membershipType: "employee" as const,
    }
    expect(iamTenantMembershipInsertSchema.safeParse(row).success).toBe(true)
  })

  it("accepts tenant-scoped role assignment (scope_id null)", () => {
    const row = {
      tenantId: tid,
      tenantMembershipId: mid,
      tenantRoleId: rid,
      scopeType: "tenant" as const,
      scopeId: null,
      effectiveFrom: "2026-01-01",
    }
    expect(iamTenantRoleAssignmentInsertSchema.safeParse(row).success).toBe(
      true
    )
  })

  it("rejects tenant scope with non-null scope_id", () => {
    const row = {
      tenantId: tid,
      tenantMembershipId: mid,
      tenantRoleId: rid,
      scopeType: "tenant" as const,
      scopeId: uid,
    }
    expect(iamTenantRoleAssignmentInsertSchema.safeParse(row).success).toBe(
      false
    )
  })

  it("rejects legal_entity scope without scope_id", () => {
    const row = {
      tenantId: tid,
      tenantMembershipId: mid,
      tenantRoleId: rid,
      scopeType: "legal_entity" as const,
    }
    expect(iamTenantRoleAssignmentInsertSchema.safeParse(row).success).toBe(
      false
    )
  })

  it("accepts a minimal authority policy row", () => {
    const row = {
      tenantId: tid,
      tenantRoleId: rid,
      policyCode: "invoices.read",
      resourceCode: "invoice",
      actionCode: "read",
    }
    expect(iamAuthorityPolicyInsertSchema.safeParse(row).success).toBe(true)
  })
})
