/**
 * Vitest: async resolvers with mocked {@link DatabaseClient} (no Postgres).
 */
import { describe, expect, it, vi } from "vitest"

import type { DatabaseClient } from "../../client"
import {
  resolveCurrentTenantPolicy,
  type TenantPolicyRecord,
} from "../resolve-current-tenant-policy"
import {
  resolveItemSettings,
  type ItemEntitySettingsRecord,
} from "../resolve-item-settings"
import { resolveMembershipScope } from "../resolve-membership-scope"

function mockDbSelectChain<T>(finalRows: T): DatabaseClient {
  const limit = vi.fn(() => Promise.resolve(finalRows))
  const orderBy = vi.fn(() => ({ limit }))
  const where = vi.fn(() => ({ orderBy }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))
  return { select } as unknown as DatabaseClient
}

function mockDbSelectJoinChain<T>(finalRows: T): DatabaseClient {
  const orderBy = vi.fn(() => Promise.resolve(finalRows))
  const where = vi.fn(() => ({ orderBy }))
  const leftJoin2 = vi.fn(() => ({ where }))
  const leftJoin1 = vi.fn(() => ({ leftJoin: leftJoin2 }))
  const from = vi.fn(() => ({ leftJoin: leftJoin1 }))
  const select = vi.fn(() => ({ from }))
  return { select } as unknown as DatabaseClient
}

describe("resolveCurrentTenantPolicy (F4)", () => {
  const tenantId = "018f1234-5678-7abc-8def-123456789abc"
  const row = {
    id: "01900000-0000-7000-8000-000000000001",
    tenantId,
    policyDomain: "mdm",
    policyKey: "x",
    status: "active" as const,
    isDeleted: false,
  } as unknown as TenantPolicyRecord

  it("returns first row or null", async () => {
    const db = mockDbSelectChain([row])
    const out = await resolveCurrentTenantPolicy(db, {
      tenantId,
      policyDomain: "mdm",
      policyKey: "x",
      asOfDate: "2026-06-01",
    })
    expect(out).toEqual(row)

    const empty = mockDbSelectChain<TenantPolicyRecord[]>([])
    expect(
      await resolveCurrentTenantPolicy(empty, {
        tenantId,
        policyDomain: "mdm",
        policyKey: "x",
        asOfDate: "2026-06-01",
      })
    ).toBeNull()
  })
})

describe("resolveItemSettings (F5)", () => {
  const tenantId = "018f1234-5678-7abc-8def-123456789abc"
  const itemId = "028f1234-5678-7abc-8def-123456789abc"
  const legalEntityId = "038f1234-5678-7abc-8def-123456789abc"
  const businessUnitId = "048f1234-5678-7abc-8def-123456789abc"
  const locationId = "058f1234-5678-7abc-8def-123456789abc"

  const baseRow = {
    id: "01900000-0000-7000-8000-000000000010",
    tenantId,
    itemId,
    legalEntityId,
  } as unknown as ItemEntitySettingsRecord

  it("returns location scope when location + BU query yields a row", async () => {
    const db = mockDbSelectChain([baseRow])
    const out = await resolveItemSettings(db, {
      tenantId,
      itemId,
      legalEntityId,
      businessUnitId,
      locationId,
      asOfDate: "2026-06-15",
    })
    expect(out.resolvedScope).toBe("location")
    expect(out.record).toEqual(baseRow)
  })

  it("falls back to business_unit when location query misses but BU matches", async () => {
    let call = 0
    const limit = vi.fn(() => {
      call++
      if (call === 1) return Promise.resolve([])
      return Promise.resolve([baseRow])
    })
    const orderBy = vi.fn(() => ({ limit }))
    const where = vi.fn(() => ({ orderBy }))
    const from = vi.fn(() => ({ where }))
    const select = vi.fn(() => ({ from }))
    const db = { select } as unknown as DatabaseClient

    const out = await resolveItemSettings(db, {
      tenantId,
      itemId,
      legalEntityId,
      businessUnitId,
      locationId,
      asOfDate: "2026-06-15",
    })
    expect(out.resolvedScope).toBe("business_unit")
    expect(limit).toHaveBeenCalledTimes(2)
  })

  it("falls back to legal_entity when scoped rows are absent", async () => {
    let call = 0
    const limit = vi.fn(() => {
      call++
      if (call <= 2) return Promise.resolve([])
      return Promise.resolve([baseRow])
    })
    const orderBy = vi.fn(() => ({ limit }))
    const where = vi.fn(() => ({ orderBy }))
    const from = vi.fn(() => ({ where }))
    const select = vi.fn(() => ({ from }))
    const db = { select } as unknown as DatabaseClient

    const out = await resolveItemSettings(db, {
      tenantId,
      itemId,
      legalEntityId,
      businessUnitId,
      locationId,
      asOfDate: "2026-06-15",
    })
    expect(out.resolvedScope).toBe("legal_entity")
    expect(limit).toHaveBeenCalledTimes(3)
  })

  it("returns null when no tier matches", async () => {
    const limit = vi.fn(() => Promise.resolve([]))
    const orderBy = vi.fn(() => ({ limit }))
    const where = vi.fn(() => ({ orderBy }))
    const from = vi.fn(() => ({ where }))
    const select = vi.fn(() => ({ from }))
    const db = { select } as unknown as DatabaseClient

    const out = await resolveItemSettings(db, {
      tenantId,
      itemId,
      legalEntityId,
      businessUnitId,
      locationId,
      asOfDate: "2026-06-15",
    })
    expect(out).toEqual({ record: null, resolvedScope: null })
    expect(limit).toHaveBeenCalledTimes(3)
  })
})

describe("resolveMembershipScope (F6)", () => {
  const tenantId = "018f1234-5678-7abc-8def-123456789abc"
  const userAccountId = "028f1234-5678-7abc-8def-123456789abd"

  const membership = {
    id: "m1",
    tenantId,
    userAccountId,
    membershipStatus: "active" as const,
    isDeleted: false,
  }

  const assignment = {
    id: "a1",
    tenantId,
    tenantMembershipId: "m1",
    tenantRoleId: "r1",
    isDeleted: false,
    scopeType: "tenant" as const,
    scopeId: null as string | null,
  }

  const role = {
    id: "r1",
    tenantId,
    roleCode: "admin",
    isDeleted: false,
  }

  it("returns empty when no rows", async () => {
    const db = mockDbSelectJoinChain<unknown[]>([])
    const out = await resolveMembershipScope(db, {
      tenantId,
      userAccountId,
      asOfDate: "2026-06-01",
    })
    expect(out).toEqual({ membership: null, roleScopes: [] })
  })

  it("returns membership and role scopes when joins produce rows", async () => {
    const row = {
      membership,
      assignment,
      role,
    }
    const db = mockDbSelectJoinChain([row])
    const out = await resolveMembershipScope(db, {
      tenantId,
      userAccountId,
      asOfDate: "2026-06-01",
    })
    expect(out.membership).toEqual(membership)
    expect(out.roleScopes).toHaveLength(1)
    expect(out.roleScopes[0]).toEqual({ assignment, role })
  })

  it("skips rows with null assignment or role", async () => {
    const row = {
      membership,
      assignment: null,
      role: null,
    }
    const db = mockDbSelectJoinChain([row])
    const out = await resolveMembershipScope(db, {
      tenantId,
      userAccountId,
      asOfDate: "2026-06-01",
    })
    expect(out.membership).toEqual(membership)
    expect(out.roleScopes).toEqual([])
  })
})
