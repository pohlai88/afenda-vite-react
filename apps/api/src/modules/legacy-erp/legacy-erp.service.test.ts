import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  __resetCounterpartiesForTests,
  __resetItemsForTests,
  listCounterparties,
  listItems,
} from "../mdm/index.js"
import {
  __resetLegacyCounterpartySourceConfigForTests,
  __resetLegacyItemSourceConfigForTests,
  __setLegacyCounterpartySourceConfigForTests,
  __setLegacyItemSourceConfigForTests,
  pullLegacyCounterpartyBatch,
  pullLegacyItemBatch,
} from "./legacy-erp-source.service.js"
import {
  adaptLegacyErpPayload,
  ingestLegacyErpBatch,
} from "./legacy-erp.service.js"

describe("adaptLegacyErpPayload", () => {
  beforeEach(() => {
    __resetCounterpartiesForTests()
    __resetItemsForTests()
    __resetLegacyCounterpartySourceConfigForTests()
    __resetLegacyItemSourceConfigForTests()
    vi.unstubAllGlobals()
  })

  it("normalizes legacy counterparties into Afenda MDM candidates", () => {
    const result = adaptLegacyErpPayload({
      tenantId: "tenant-1",
      request: {
        entityKind: "counterparty",
        sourceSystem: "legacy_crm",
        payload: {
          externalId: "crm-42",
          externalCode: "  acme retail ",
          name: "  Acme   Retail ",
          type: "vendor",
          status: "disabled",
          alias: "Acme",
          taxCode: "TH-123",
        },
      },
    })

    expect(result.targetBoundary).toBe("mdm.counterparty")
    expect(result.provenance.sourceRecordId).toBe("crm-42")
    expect(result.normalizedRecord).toMatchObject({
      tenantId: "tenant-1",
      code: "ACME-RETAIL",
      displayName: "Acme Retail",
      canonicalName: "ACME RETAIL",
      kind: "supplier",
      status: "inactive",
      taxRegistrationNumber: "TH-123",
      aliases: ["Acme"],
    })
  })

  it("converts legacy journals into validated Afenda finance journal candidates", () => {
    const result = adaptLegacyErpPayload({
      tenantId: "tenant-1",
      request: {
        entityKind: "journal-entry",
        sourceSystem: "legacy_accounting",
        payload: {
          id: "je-100",
          journalNumber: "JE-202604-00001",
          date: "2026-04-24T00:00:00.000Z",
          description: "Revenue recognition",
          journalType: "accrual",
          status: "posted",
          lines: [
            {
              accountCode: "4000",
              amount: 1250,
              side: "credit",
            },
            {
              accountCode: "1200",
              amount: 1250,
              side: "debit",
            },
          ],
        },
      },
    })

    expect(result.targetBoundary).toBe("finance.journal-entry")
    expect(result.normalizedRecord.targetJournalType).toBe("ACCRUAL")
    expect(result.normalizedRecord.targetStatus).toBe("POSTED")
    expect(result.normalizedRecord.autoPost).toBe(true)
    expect(result.normalizedRecord.lines).toEqual([
      expect.objectContaining({
        accountId: "4000",
        debitAmount: 0,
        creditAmount: 1250,
      }),
      expect.objectContaining({
        accountId: "1200",
        debitAmount: 1250,
        creditAmount: 0,
      }),
    ])
  })

  it("normalizes legacy inventory items into Afenda item records", () => {
    const result = adaptLegacyErpPayload({
      tenantId: "tenant-1",
      request: {
        entityKind: "inventory-item",
        sourceSystem: "legacy_mrp",
        payload: {
          externalId: "item-77",
          sku: "rm-001",
          name: " Resin Pellet ",
          status: "available",
          uom: "KG",
          category: "Raw Material",
          onHandQuantity: 420.5,
        },
      },
    })

    expect(result.targetBoundary).toBe("mdm.item")
    expect(result.normalizedRecord).toMatchObject({
      tenantId: "tenant-1",
      itemCode: "RM-001",
      itemName: "Resin Pellet",
      canonicalName: "RESIN PELLET",
      itemType: "inventory",
      status: "active",
      baseUomCode: "KG",
      categoryCode: "Raw Material",
      onHandQuantity: 420.5,
    })
  })

  it("rejects unbalanced legacy journals", () => {
    expect(() =>
      adaptLegacyErpPayload({
        tenantId: "tenant-1",
        request: {
          entityKind: "journal-entry",
          sourceSystem: "legacy_accounting",
          payload: {
            date: "2026-04-24T00:00:00.000Z",
            description: "Broken journal",
            lines: [
              {
                accountCode: "4000",
                amount: 1250,
                side: "credit",
              },
            ],
          },
        },
      })
    ).toThrow(/Journal entries require at least two lines|not balanced/i)
  })

  it("ingests counterparties and items through their canonical MDM boundaries", async () => {
    const result = await ingestLegacyErpBatch({
      tenantId: "tenant-1",
      request: {
        records: [
          {
            entityKind: "counterparty",
            sourceSystem: "legacy_crm",
            payload: {
              externalId: "crm-88",
              name: "Eastern Partners",
              type: "customer",
            },
          },
          {
            entityKind: "inventory-item",
            sourceSystem: "legacy_mrp",
            payload: {
              sku: "RM-002",
              name: "Resin Additive",
            },
          },
        ],
      },
    })

    expect(result.totalRecords).toBe(2)
    expect(result.persistedCount).toBe(2)
    expect(result.candidateOnlyCount).toBe(0)
    expect(result.results[0]).toMatchObject({
      disposition: "persisted",
      persistedRecord: {
        entityKind: "counterparty",
        code: "EASTERN-PARTNERS",
      },
    })
    expect(result.results[1]).toMatchObject({
      disposition: "persisted",
      persistedRecord: {
        entityKind: "inventory-item",
        code: "RM-002",
      },
    })

    await expect(
      listCounterparties({
        tenantId: "tenant-1",
        query: {
          search: "Eastern Partners",
        },
      })
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "EASTERN-PARTNERS",
          displayName: "Eastern Partners",
        }),
      ])
    )

    await expect(
      listItems({
        tenantId: "tenant-1",
        query: {
          search: "Resin Additive",
        },
      })
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemCode: "RM-002",
          itemName: "Resin Additive",
        }),
      ])
    )
  })

  it("pulls paginated legacy TPM customers and maps them into Afenda counterparty intake records", async () => {
    __setLegacyCounterpartySourceConfigForTests({
      sourceProfile: "legacy-tpm-customers",
      sourceSystem: "legacy_tpm",
      baseUrl: "https://legacy.example.test/api",
      bearerToken: "token-123",
      tenantId: "legacy-tenant-1",
      endpointPath: "/customers",
    })

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "cust-1",
                code: "CUST001",
                name: "ABC Corp",
                taxCode: "TAX-001",
                isActive: true,
              },
            ],
            metadata: {
              pageNumber: 1,
              pageSize: 1,
              totalPages: 2,
              totalCount: 2,
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "cust-2",
                code: "CUST002",
                name: "XYZ Retail",
                isActive: false,
              },
            ],
            metadata: {
              pageNumber: 2,
              pageSize: 1,
              totalPages: 2,
              totalCount: 2,
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )

    vi.stubGlobal("fetch", fetchMock)

    const result = await pullLegacyCounterpartyBatch({
      request: {
        sourceProfile: "legacy-tpm-customers",
        pageSize: 1,
        maxRecords: 10,
      },
    })

    expect(result.sourceSystem).toBe("legacy_tpm")
    expect(result.fetchedCount).toBe(2)
    expect(result.pagesFetched).toBe(2)
    expect(result.records).toEqual([
      {
        entityKind: "counterparty",
        sourceSystem: "legacy_tpm",
        payload: {
          externalId: "cust-1",
          code: "CUST001",
          name: "ABC Corp",
          type: "customer",
          status: "active",
          taxCode: "TAX-001",
          aliases: undefined,
        },
      },
      {
        entityKind: "counterparty",
        sourceSystem: "legacy_tpm",
        payload: {
          externalId: "cust-2",
          code: "CUST002",
          name: "XYZ Retail",
          type: "customer",
          status: "inactive",
          taxCode: undefined,
          aliases: undefined,
        },
      },
    ])

    vi.unstubAllGlobals()
  })

  it("pulls paginated legacy MRP products and maps them into Afenda item intake records", async () => {
    __setLegacyItemSourceConfigForTests({
      sourceProfile: "legacy-mrp-products",
      sourceSystem: "legacy_mrp",
      baseUrl: "https://legacy.example.test/api",
      bearerToken: "token-123",
      tenantId: "legacy-tenant-1",
      endpointPath: "/products",
    })

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "prod-1",
                sku: "FG-001",
                name: "Finished Syrup",
                status: "active",
              },
            ],
            pagination: {
              page: 1,
              pageSize: 1,
              totalPages: 2,
              total: 2,
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "prod-2",
                sku: "RM-010",
                name: "Flavor Base",
                status: "inactive",
              },
            ],
            pagination: {
              page: 2,
              pageSize: 1,
              totalPages: 2,
              total: 2,
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )

    vi.stubGlobal("fetch", fetchMock)

    const result = await pullLegacyItemBatch({
      request: {
        sourceProfile: "legacy-mrp-products",
        pageSize: 1,
        maxRecords: 10,
      },
    })

    expect(result.sourceSystem).toBe("legacy_mrp")
    expect(result.fetchedCount).toBe(2)
    expect(result.pagesFetched).toBe(2)
    expect(result.records).toEqual([
      {
        entityKind: "inventory-item",
        sourceSystem: "legacy_mrp",
        payload: {
          externalId: "prod-1",
          sku: "FG-001",
          name: "Finished Syrup",
          status: "active",
          itemType: "inventory",
          baseUomCode: "EA",
        },
      },
      {
        entityKind: "inventory-item",
        sourceSystem: "legacy_mrp",
        payload: {
          externalId: "prod-2",
          sku: "RM-010",
          name: "Flavor Base",
          status: "inactive",
          itemType: "inventory",
          baseUomCode: "EA",
        },
      },
    ])
  })
})
