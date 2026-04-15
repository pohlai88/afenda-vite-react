import { describe, expect, it } from "vitest"

import type { DatabaseClient } from "../../../client"
import {
  IdentityLinkMissingError,
  requireAfendaMeContextFromBetterAuthUserId,
  resolveAfendaMeContextFromBetterAuthUserId,
} from "../resolve-afenda-me-context"

const T1 = "11111111-1111-1111-1111-111111111111"
const AFENDA_USER = "22222222-2222-2222-2222-222222222222"
const BA_USER = "ba-user-text-id"

/** Matches `select→from→where→limit` (identity link) then `select→from→innerJoin→where` (memberships). */
function createBridgeMockDb(options: {
  identityBatch: unknown[]
  membershipBatch: unknown[]
}): DatabaseClient {
  let fromCalls = 0
  return {
    select: () => ({
      from: () => {
        fromCalls += 1
        if (fromCalls === 1) {
          return {
            where: () => ({
              limit: () => Promise.resolve(options.identityBatch),
            }),
          }
        }
        return {
          innerJoin: () => ({
            where: () => Promise.resolve(options.membershipBatch),
          }),
        }
      },
    }),
  } as unknown as DatabaseClient
}

describe("resolveAfendaMeContextFromBetterAuthUserId", () => {
  it("returns null when identity link is missing", async () => {
    const db = createBridgeMockDb({ identityBatch: [], membershipBatch: [] })
    const r = await resolveAfendaMeContextFromBetterAuthUserId(db, BA_USER)
    expect(r).toBeNull()
  })

  it("returns Afenda user and tenant slice when link and memberships exist", async () => {
    const db = createBridgeMockDb({
      identityBatch: [{ afendaUserId: AFENDA_USER }],
      membershipBatch: [
        {
          tenantId: T1,
          status: "active",
          tenantStatus: "active",
        },
      ],
    })
    const r = await resolveAfendaMeContextFromBetterAuthUserId(db, BA_USER)
    expect(r).toEqual({
      afendaUserId: AFENDA_USER,
      tenantIds: [T1],
      defaultTenantId: T1,
    })
  })

  it("requireAfendaMeContextFromBetterAuthUserId throws when link is missing", async () => {
    const db = createBridgeMockDb({ identityBatch: [], membershipBatch: [] })
    await expect(
      requireAfendaMeContextFromBetterAuthUserId(db, BA_USER)
    ).rejects.toBeInstanceOf(IdentityLinkMissingError)
  })
})
