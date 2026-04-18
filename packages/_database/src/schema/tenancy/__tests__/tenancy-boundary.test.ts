/**
 * Vitest: `tenancy-boundary.schema.ts` + shared enum parity (see module annotation envelopes).
 */
import { describe, expect, it } from "vitest"

import {
  governanceLevelEnum,
  membershipStatusEnum,
  membershipTypeEnum,
  statusEnum,
  tenantTypeEnum,
} from "../../shared/enums.schema"
import {
  afendaMeContextSchema,
  resolveActiveTenantContextParamsSchema,
  tenancyMdmGovernanceLevelSchema,
  tenancyMembershipStatusSchema,
  tenancyMembershipTypeSchema,
  tenancyTenantStatusSchema,
  tenancyTenantTypeSchema,
} from "../tenancy-boundary.schema"
import { sharedTenantIdSchema } from "../../shared/shared-boundary.schema"

const sampleUuid = "018f1234-5678-7abc-8def-123456789abc"

describe("tenancy boundary aliases", () => {
  it("mirrors shared enum validators for tenant + membership labels", () => {
    for (const v of tenantTypeEnum.enumValues) {
      expect(tenancyTenantTypeSchema.safeParse(v).success).toBe(true)
    }
    for (const v of statusEnum.enumValues) {
      expect(tenancyTenantStatusSchema.safeParse(v).success).toBe(true)
    }
    for (const v of membershipStatusEnum.enumValues) {
      expect(tenancyMembershipStatusSchema.safeParse(v).success).toBe(true)
    }
    for (const v of membershipTypeEnum.enumValues) {
      expect(tenancyMembershipTypeSchema.safeParse(v).success).toBe(true)
    }
  })

  it("rejects invalid tenant status", () => {
    expect(tenancyTenantStatusSchema.safeParse("not_a_status").success).toBe(
      false
    )
  })
})

describe("resolveActiveTenantContextParamsSchema", () => {
  it("parses minimal input", () => {
    const r = resolveActiveTenantContextParamsSchema.safeParse({
      authUserId: "user-1",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.authProvider).toBe("better-auth")
    }
  })

  it("accepts active tenant id when provided", () => {
    const r = resolveActiveTenantContextParamsSchema.safeParse({
      authUserId: "user-1",
      activeTenantId: sampleUuid,
    })
    expect(r.success).toBe(true)
  })

  it("rejects invalid active tenant id", () => {
    const r = resolveActiveTenantContextParamsSchema.safeParse({
      authUserId: "user-1",
      activeTenantId: "not-uuid",
    })
    expect(r.success).toBe(false)
  })
})

describe("afendaMeContextSchema", () => {
  it("round-trips a valid context", () => {
    const payload = {
      afendaUserId: sampleUuid,
      tenantIds: [sampleUuid],
      defaultTenantId: sampleUuid,
    }
    const r = afendaMeContextSchema.safeParse(payload)
    expect(r.success).toBe(true)
  })

  it("allows empty tenant list", () => {
    const r = afendaMeContextSchema.safeParse({
      afendaUserId: sampleUuid,
      tenantIds: [],
      defaultTenantId: null,
    })
    expect(r.success).toBe(true)
  })
})

describe("governance level (tenants DDL)", () => {
  it("accepts every governance level value", () => {
    for (const v of governanceLevelEnum.enumValues) {
      expect.soft(tenancyMdmGovernanceLevelSchema.safeParse(v).success).toBe(
        true
      )
    }
  })
})

describe("tenant id array elements", () => {
  it("uses same UUID rule as tenant FK", () => {
    expect(sharedTenantIdSchema.safeParse(sampleUuid).success).toBe(true)
  })
})
