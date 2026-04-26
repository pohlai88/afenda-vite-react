import { describe, expect, it } from "vitest"

import { MemorySearchEngineAdapter } from "../src/memory-search-engine.adapter"
import { SearchClientService } from "../src/search-client.service"
import {
  createSearchIndexRegistry,
  defaultSearchIndexConfigs,
} from "../src/search-index-registry"
import { SearchIndexerService } from "../src/search-indexer.service"
import { SearchSyncService } from "../src/search-sync.service"

describe("@afenda/search", () => {
  it("indexes and searches documents across entities", async () => {
    const engine = new MemorySearchEngineAdapter()
    const indexer = new SearchIndexerService({
      engine,
      registry: createSearchIndexRegistry(defaultSearchIndexConfigs),
    })
    const client = new SearchClientService(engine)

    await indexer.indexBatch("customer", [
      {
        id: "cust_1",
        entity: "customer",
        module: "crm",
        title: "Acme Corporation",
        description: "Primary distribution customer",
        url: "/customers/cust_1",
        metadata: { status: "active", email: "ops@acme.test" },
      },
      {
        id: "cust_2",
        entity: "customer",
        module: "crm",
        title: "Northwind Traders",
        description: "Secondary customer",
        url: "/customers/cust_2",
        metadata: { status: "lead" },
      },
    ])

    const results = await client.search({
      query: "Acme",
      entities: ["customer"],
    })

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      id: "cust_1",
      entity: "customer",
      module: "crm",
    })
  })

  it("supports module-scoped search and suggestions", async () => {
    const engine = new MemorySearchEngineAdapter()
    const indexer = new SearchIndexerService({
      engine,
      registry: createSearchIndexRegistry(defaultSearchIndexConfigs),
    })
    const client = new SearchClientService(engine)

    await indexer.indexBatch("invoice", [
      {
        id: "inv_1",
        entity: "invoice",
        module: "accounting",
        title: "Invoice INV-001",
        description: "April settlement invoice",
        url: "/invoices/inv_1",
        metadata: { status: "open" },
      },
    ])

    const results = await client.searchModule("accounting", "invoice")
    const suggestions = await client.suggest("inv", 5)

    expect(results).toHaveLength(1)
    expect(suggestions[0]).toMatchObject({
      query: "Invoice INV-001",
      module: "accounting",
    })
  })

  it("filters indexed documents by metadata fields", async () => {
    const engine = new MemorySearchEngineAdapter()
    const indexer = new SearchIndexerService({
      engine,
      registry: createSearchIndexRegistry(defaultSearchIndexConfigs),
    })
    const client = new SearchClientService(engine)

    await indexer.indexBatch("task", [
      {
        id: "task_1",
        entity: "task",
        module: "project_management",
        title: "Approve release",
        description: "Release gate approval",
        url: "/tasks/task_1",
        metadata: { priority: "high", status: "open" },
      },
      {
        id: "task_2",
        entity: "task",
        module: "project_management",
        title: "Review copy",
        description: "Marketing review",
        url: "/tasks/task_2",
        metadata: { priority: "low", status: "open" },
      },
    ])

    const results = await client.search({
      query: "review",
      filters: [{ field: "priority", value: "low" }],
    })

    expect(results).toHaveLength(1)
    expect(results[0]?.id).toBe("task_2")
  })

  it("processes queued sync events into index operations", async () => {
    const engine = new MemorySearchEngineAdapter()
    const indexer = new SearchIndexerService({
      engine,
      registry: createSearchIndexRegistry(defaultSearchIndexConfigs),
    })
    const sync = new SearchSyncService({
      indexer,
      flushIntervalMs: 1000,
    })

    await sync.queueSync({
      entity: "product",
      action: "create",
      documentId: "prod_1",
      document: {
        id: "prod_1",
        entity: "product",
        module: "inventory",
        title: "Precision Cutter",
        description: "Inventory item",
        url: "/products/prod_1",
        metadata: { sku: "CUT-001" },
      },
    })
    await sync.flush()

    expect((await engine.getIndexStats("product")).numberOfDocuments).toBe(1)

    await sync.syncImmediate({
      entity: "product",
      action: "delete",
      documentId: "prod_1",
    })

    expect((await engine.getIndexStats("product")).numberOfDocuments).toBe(0)
  })

  it("fails loudly when indexing an unconfigured entity", async () => {
    const engine = new MemorySearchEngineAdapter()
    const indexer = new SearchIndexerService({
      engine,
      registry: createSearchIndexRegistry([]),
    })

    await expect(
      indexer.indexDocument("customer", {
        id: "cust_missing",
        entity: "customer",
        module: "crm",
        title: "Missing",
        description: "Missing config",
        url: "/customers/cust_missing",
        metadata: {},
      })
    ).rejects.toThrow(
      'No search index config registered for entity "customer".'
    )
  })
})
