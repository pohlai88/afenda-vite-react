import { beforeEach, describe, expect, it } from "vitest"

import { conflict, notFound } from "../../../api-errors.js"
import {
  __resetCounterpartiesForTests,
  createCounterparty,
  getCounterparty,
  listCounterparties,
} from "./counterparty.service.js"

describe("counterparty.service", () => {
  beforeEach(() => {
    __resetCounterpartiesForTests()
  })

  it("lists canonical counterparties for a tenant", async () => {
    await expect(
      listCounterparties({
        tenantId: "tenant-1",
        query: {},
      })
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "counterparty-atlas",
          displayName: "Atlas Commerce",
        }),
      ])
    )
  })

  it("gets a canonical counterparty by id", async () => {
    await expect(
      getCounterparty({
        tenantId: "tenant-1",
        counterpartyId: "counterparty-northstar",
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: "counterparty-northstar",
        canonicalName: "NORTHSTAR LOGISTICS",
      })
    )
  })

  it("normalizes names and codes on create", async () => {
    const created = await createCounterparty({
      tenantId: "tenant-1",
      payload: {
        displayName: "  Eastern   Partners ",
        aliases: ["East Partners"],
        kind: "customer",
        status: "active",
      },
    })

    expect(created.displayName).toBe("Eastern Partners")
    expect(created.canonicalName).toBe("EASTERN PARTNERS")
    expect(created.code).toBe("EASTERN-PARTNERS")
  })

  it("rejects duplicate canonical codes per tenant", async () => {
    await expect(
      createCounterparty({
        tenantId: "tenant-1",
        payload: {
          code: "atlas-commerce",
          displayName: "Atlas Duplicate",
          aliases: [],
          kind: "customer",
          status: "active",
        },
      })
    ).rejects.toMatchObject({
      code: conflict("x").code,
    })
  })

  it("throws notFound for a missing tenant-scoped record", async () => {
    await expect(
      getCounterparty({
        tenantId: "tenant-2",
        counterpartyId: "counterparty-northstar",
      })
    ).rejects.toMatchObject({
      code: notFound("x").code,
    })
  })
})
