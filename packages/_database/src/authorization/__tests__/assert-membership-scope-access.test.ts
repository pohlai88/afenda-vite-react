import { describe, expect, it } from "vitest"

import {
  evaluateMembershipScopeGrant,
  MembershipScopeAccessError,
} from "../services/assert-membership-scope-access"

const T = "11111111-1111-1111-1111-111111111111"
const LE = "22222222-2222-2222-2222-222222222222"

describe("evaluateMembershipScopeGrant", () => {
  it("grants membership-default when no scope rows", () => {
    const g = evaluateMembershipScopeGrant({
      tenantId: T,
      scopeType: "legal_entity",
      scopeId: LE,
      rows: [],
    })
    expect(g.reason).toBe("membership-default")
  })

  it("denies on type exclude", () => {
    expect(() =>
      evaluateMembershipScopeGrant({
        tenantId: T,
        scopeType: "legal_entity",
        scopeId: LE,
        rows: [
          {
            scopeType: "legal_entity",
            scopeId: LE,
            accessMode: "exclude",
          },
        ],
      })
    ).toThrow(MembershipScopeAccessError)
  })

  it("denies on tenant exclude for active tenant", () => {
    expect(() =>
      evaluateMembershipScopeGrant({
        tenantId: T,
        scopeType: "legal_entity",
        scopeId: LE,
        rows: [
          {
            scopeType: "tenant",
            scopeId: T,
            accessMode: "exclude",
          },
        ],
      })
    ).toThrow(MembershipScopeAccessError)
  })

  it("requires type include when any include exists for that type", () => {
    expect(() =>
      evaluateMembershipScopeGrant({
        tenantId: T,
        scopeType: "legal_entity",
        scopeId: LE,
        rows: [
          {
            scopeType: "legal_entity",
            scopeId: "33333333-3333-3333-3333-333333333333",
            accessMode: "include",
          },
        ],
      })
    ).toThrow(MembershipScopeAccessError)
  })

  it("allows type-include when include matches", () => {
    const g = evaluateMembershipScopeGrant({
      tenantId: T,
      scopeType: "legal_entity",
      scopeId: LE,
      rows: [
        {
          scopeType: "legal_entity",
          scopeId: LE,
          accessMode: "include",
        },
      ],
    })
    expect(g.reason).toBe("type-include")
  })

  it("requires tenant include when tenant includes exist", () => {
    expect(() =>
      evaluateMembershipScopeGrant({
        tenantId: T,
        scopeType: "legal_entity",
        scopeId: LE,
        rows: [
          {
            scopeType: "tenant",
            scopeId: "99999999-9999-9999-9999-999999999999",
            accessMode: "include",
          },
        ],
      })
    ).toThrow(MembershipScopeAccessError)
  })
})
