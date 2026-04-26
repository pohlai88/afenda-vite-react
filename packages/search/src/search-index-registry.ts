import type { SearchEntityKey, SearchIndexConfig } from "./search.contract"

export const customerSearchIndexConfig: SearchIndexConfig = {
  entity: "customer",
  name: "customers",
  primaryKey: "id",
  searchableAttributes: ["title", "description", "email", "phone"],
  filterableAttributes: ["module", "status"],
  sortableAttributes: ["title"],
  displayedAttributes: ["id", "title", "description", "url", "metadata"],
}

export const productSearchIndexConfig: SearchIndexConfig = {
  entity: "product",
  name: "products",
  primaryKey: "id",
  searchableAttributes: ["title", "description", "sku"],
  filterableAttributes: ["module", "status", "category"],
  sortableAttributes: ["title"],
  displayedAttributes: ["id", "title", "description", "url", "metadata"],
}

export const orderSearchIndexConfig: SearchIndexConfig = {
  entity: "order",
  name: "orders",
  primaryKey: "id",
  searchableAttributes: ["title", "description", "orderNumber"],
  filterableAttributes: ["module", "status"],
  sortableAttributes: ["title"],
  displayedAttributes: ["id", "title", "description", "url", "metadata"],
}

export const invoiceSearchIndexConfig: SearchIndexConfig = {
  entity: "invoice",
  name: "invoices",
  primaryKey: "id",
  searchableAttributes: ["title", "description", "invoiceNumber"],
  filterableAttributes: ["module", "status"],
  sortableAttributes: ["title"],
  displayedAttributes: ["id", "title", "description", "url", "metadata"],
}

export const employeeSearchIndexConfig: SearchIndexConfig = {
  entity: "employee",
  name: "employees",
  primaryKey: "id",
  searchableAttributes: ["title", "description", "email"],
  filterableAttributes: ["module", "department"],
  sortableAttributes: ["title"],
  displayedAttributes: ["id", "title", "description", "url", "metadata"],
}

export const taskSearchIndexConfig: SearchIndexConfig = {
  entity: "task",
  name: "tasks",
  primaryKey: "id",
  searchableAttributes: ["title", "description"],
  filterableAttributes: ["module", "status", "priority"],
  sortableAttributes: ["title"],
  displayedAttributes: ["id", "title", "description", "url", "metadata"],
}

export const defaultSearchIndexConfigs = [
  customerSearchIndexConfig,
  productSearchIndexConfig,
  orderSearchIndexConfig,
  invoiceSearchIndexConfig,
  employeeSearchIndexConfig,
  taskSearchIndexConfig,
] as const

export function createSearchIndexRegistry(
  configs: readonly SearchIndexConfig[] = defaultSearchIndexConfigs
): ReadonlyMap<SearchEntityKey, SearchIndexConfig> {
  return new Map(configs.map((config) => [config.entity, config]))
}

export function getSearchIndexConfig(
  entity: SearchEntityKey,
  registry: ReadonlyMap<
    SearchEntityKey,
    SearchIndexConfig
  > = createSearchIndexRegistry()
): SearchIndexConfig | undefined {
  return registry.get(entity)
}
