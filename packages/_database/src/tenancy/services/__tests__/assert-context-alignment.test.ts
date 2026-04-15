import { describe, expect, it } from "vitest"

import type { DatabaseClient } from "../../../client"
import {
  assertContextAlignment,
  ContextAlignmentError,
} from "../assert-context-alignment"

const T = "11111111-1111-1111-1111-111111111111"
const LE_A = "22222222-2222-2222-2222-222222222222"
const LE_B = "33333333-3333-3333-3333-333333333333"
const BU_X = "44444444-4444-4444-4444-444444444444"
const BU_Y = "55555555-5555-5555-5555-555555555555"
const LOC = "66666666-6666-6666-6666-666666666666"
const LOC2 = "77777777-7777-7777-7777-777777777777"
const OU = "88888888-8888-8888-8888-888888888888"
const OTHER_TENANT = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

/**
 * Drizzle-style chain: each `.select().from().where().limit()` consumes the next row batch.
 */
function createQueuedSelectDb(
  rowBatches: unknown[][]
): DatabaseClient {
  let i = 0
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => {
            const batch = rowBatches[i] ?? []
            i += 1
            return Promise.resolve(batch)
          },
        }),
      }),
    }),
  } as unknown as DatabaseClient
}

describe("assertContextAlignment", () => {
  it("allows same tenant with all optional dimensions omitted (no DB reads)", async () => {
    const db = createQueuedSelectDb([])
    const result = await assertContextAlignment({
      db,
      tenantId: T,
    })
    expect(result).toEqual({
      tenantId: T,
      legalEntity: null,
      businessUnit: null,
      location: null,
      orgUnit: null,
    })
  })

  it("allows location bound to legal entity A when active legal entity is A", async () => {
    const db = createQueuedSelectDb([
      [{ id: LE_A, tenantId: T }],
      [
        {
          id: LOC,
          tenantId: T,
          legalEntityId: LE_A,
          businessUnitId: null,
        },
      ],
    ])
    const result = await assertContextAlignment({
      db,
      tenantId: T,
      activeLegalEntityId: LE_A,
      activeLocationId: LOC,
    })
    expect(result.legalEntity).toEqual({ id: LE_A })
    expect(result.location?.id).toBe(LOC)
  })

  it("allows org unit bound to location X when active location is X", async () => {
    const db = createQueuedSelectDb([
      [
        {
          id: LOC,
          tenantId: T,
          legalEntityId: null,
          businessUnitId: null,
        },
      ],
      [
        {
          id: OU,
          tenantId: T,
          legalEntityId: null,
          businessUnitId: null,
          locationId: LOC,
        },
      ],
    ])
    const result = await assertContextAlignment({
      db,
      tenantId: T,
      activeLocationId: LOC,
      activeOrgUnitId: OU,
    })
    expect(result.location?.id).toBe(LOC)
    expect(result.orgUnit?.id).toBe(OU)
  })

  it("rejects legal entity that belongs to another tenant", async () => {
    const db = createQueuedSelectDb([[{ id: LE_A, tenantId: OTHER_TENANT }]])
    await expect(
      assertContextAlignment({
        db,
        tenantId: T,
        activeLegalEntityId: LE_A,
      })
    ).rejects.toMatchObject({
      name: "ContextAlignmentError",
      code: "CONTEXT_ALIGNMENT",
    })
  })

  it("rejects org unit that belongs to another tenant", async () => {
    const db = createQueuedSelectDb([
      [
        {
          id: OU,
          tenantId: OTHER_TENANT,
          legalEntityId: null,
          businessUnitId: null,
          locationId: null,
        },
      ],
    ])
    await expect(
      assertContextAlignment({
        db,
        tenantId: T,
        activeOrgUnitId: OU,
      })
    ).rejects.toMatchObject({
      name: "ContextAlignmentError",
      code: "CONTEXT_ALIGNMENT",
    })
  })

  it("rejects when location is bound to legal entity A but active legal entity is B", async () => {
    const db = createQueuedSelectDb([
      [{ id: LE_B, tenantId: T }],
      [
        {
          id: LOC,
          tenantId: T,
          legalEntityId: LE_A,
          businessUnitId: null,
        },
      ],
    ])
    await expect(
      assertContextAlignment({
        db,
        tenantId: T,
        activeLegalEntityId: LE_B,
        activeLocationId: LOC,
      })
    ).rejects.toMatchObject({
      name: "ContextAlignmentError",
      code: "CONTEXT_ALIGNMENT",
    })
  })

  it("rejects when org unit is bound to business unit X but active business unit is Y", async () => {
    const db = createQueuedSelectDb([
      [{ id: BU_Y, tenantId: T }],
      [
        {
          id: OU,
          tenantId: T,
          legalEntityId: null,
          businessUnitId: BU_X,
          locationId: null,
        },
      ],
    ])
    await expect(
      assertContextAlignment({
        db,
        tenantId: T,
        activeBusinessUnitId: BU_Y,
        activeOrgUnitId: OU,
      })
    ).rejects.toMatchObject({
      name: "ContextAlignmentError",
      code: "CONTEXT_ALIGNMENT",
    })
  })

  it("rejects when org unit is bound to location X but active location is Y", async () => {
    const db = createQueuedSelectDb([
      [
        {
          id: LOC2,
          tenantId: T,
          legalEntityId: null,
          businessUnitId: null,
        },
      ],
      [
        {
          id: OU,
          tenantId: T,
          legalEntityId: null,
          businessUnitId: null,
          locationId: LOC,
        },
      ],
    ])
    await expect(
      assertContextAlignment({
        db,
        tenantId: T,
        activeLocationId: LOC2,
        activeOrgUnitId: OU,
      })
    ).rejects.toMatchObject({
      name: "ContextAlignmentError",
      code: "CONTEXT_ALIGNMENT",
    })
  })

  it("allows location with null businessUnitId alongside an active business unit (null is unconstrained)", async () => {
    const db = createQueuedSelectDb([
      [{ id: BU_X, tenantId: T }],
      [
        {
          id: LOC,
          tenantId: T,
          legalEntityId: null,
          businessUnitId: null,
        },
      ],
    ])
    const result = await assertContextAlignment({
      db,
      tenantId: T,
      activeBusinessUnitId: BU_X,
      activeLocationId: LOC,
    })
    expect(result.businessUnit?.id).toBe(BU_X)
    expect(result.location?.id).toBe(LOC)
  })

  it("rejects when location is bound to business unit X but active business unit is Y", async () => {
    const db = createQueuedSelectDb([
      [{ id: BU_Y, tenantId: T }],
      [
        {
          id: LOC,
          tenantId: T,
          legalEntityId: null,
          businessUnitId: BU_X,
        },
      ],
    ])
    await expect(
      assertContextAlignment({
        db,
        tenantId: T,
        activeBusinessUnitId: BU_Y,
        activeLocationId: LOC,
      })
    ).rejects.toMatchObject({
      name: "ContextAlignmentError",
      code: "CONTEXT_ALIGNMENT",
    })
  })

  it("throws ContextAlignmentError with stable code for not-found rows", async () => {
    const db = createQueuedSelectDb([[]])
    try {
      await assertContextAlignment({
        db,
        tenantId: T,
        activeLegalEntityId: LE_A,
      })
      expect.fail("expected throw")
    } catch (e) {
      expect(e).toBeInstanceOf(ContextAlignmentError)
      expect((e as ContextAlignmentError).code).toBe("CONTEXT_ALIGNMENT")
    }
  })
})
