export type SearchEntityKey =
  | "customer"
  | "product"
  | "order"
  | "invoice"
  | "employee"
  | "project"
  | "task"
  | "lead"
  | "production_order"
  | "document"

export type SearchModuleKey =
  | "crm"
  | "inventory"
  | "sales"
  | "accounting"
  | "hr"
  | "project_management"
  | "production"
  | "document_management"

export type SearchHighlight = {
  readonly field: string
  readonly snippet: string
}

export type SearchDocument = {
  readonly id: string
  readonly entity: SearchEntityKey
  readonly module: SearchModuleKey
  readonly title: string
  readonly description: string
  readonly url: string
  readonly metadata: Readonly<Record<string, unknown>>
} & Readonly<Record<string, unknown>>

export type SearchResult = {
  readonly id: string
  readonly entity: SearchEntityKey
  readonly module: SearchModuleKey
  readonly title: string
  readonly description: string
  readonly url: string
  readonly score: number
  readonly highlights: readonly SearchHighlight[]
  readonly metadata: Readonly<Record<string, unknown>>
}

export type SearchFilterValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]

export type SearchFilter = {
  readonly field: string
  readonly value: SearchFilterValue
}

export type SearchQuery = {
  readonly query: string
  readonly entities?: readonly SearchEntityKey[]
  readonly modules?: readonly SearchModuleKey[]
  readonly filters?: readonly SearchFilter[]
  readonly sort?: readonly string[]
  readonly limit?: number
  readonly offset?: number
}

export type SearchSuggestion = {
  readonly query: string
  readonly entity: SearchEntityKey
  readonly module: SearchModuleKey
  readonly count: number
}

export type SearchIndexConfig = {
  readonly entity: SearchEntityKey
  readonly name: string
  readonly primaryKey: string
  readonly searchableAttributes: readonly string[]
  readonly filterableAttributes: readonly string[]
  readonly sortableAttributes: readonly string[]
  readonly displayedAttributes: readonly string[]
  readonly synonyms?: Readonly<Record<string, readonly string[]>>
  readonly stopWords?: readonly string[]
}

export type SearchSyncAction = "create" | "update" | "delete"

export type SearchSyncEvent = {
  readonly entity: SearchEntityKey
  readonly action: SearchSyncAction
  readonly documentId: string
  readonly document?: SearchDocument
}

export interface SearchEngine {
  search(query: SearchQuery): Promise<readonly SearchResult[]>
  suggest(query: string, limit?: number): Promise<readonly SearchSuggestion[]>
  indexDocument(
    entity: SearchEntityKey,
    document: SearchDocument
  ): Promise<void>
  indexBatch(
    entity: SearchEntityKey,
    documents: readonly SearchDocument[]
  ): Promise<void>
  removeDocument(entity: SearchEntityKey, documentId: string): Promise<void>
  clearIndex(entity: SearchEntityKey): Promise<void>
  getIndexStats(entity: SearchEntityKey): Promise<{
    readonly numberOfDocuments: number
  }>
}
