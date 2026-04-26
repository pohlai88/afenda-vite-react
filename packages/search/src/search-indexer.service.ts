import type {
  SearchDocument,
  SearchEngine,
  SearchEntityKey,
  SearchIndexConfig,
} from "./search.contract"

export interface SearchIndexerServiceOptions {
  readonly engine: SearchEngine
  readonly registry: ReadonlyMap<SearchEntityKey, SearchIndexConfig>
}

export class SearchIndexerService {
  private readonly engine: SearchEngine
  private readonly registry: ReadonlyMap<SearchEntityKey, SearchIndexConfig>

  constructor(options: SearchIndexerServiceOptions) {
    this.engine = options.engine
    this.registry = options.registry
  }

  async indexDocument(
    entity: SearchEntityKey,
    document: SearchDocument
  ): Promise<void> {
    this.assertEntityConfigured(entity)
    await this.engine.indexDocument(entity, document)
  }

  async indexBatch(
    entity: SearchEntityKey,
    documents: readonly SearchDocument[]
  ): Promise<void> {
    this.assertEntityConfigured(entity)
    if (documents.length === 0) {
      return
    }
    await this.engine.indexBatch(entity, documents)
  }

  async removeDocument(
    entity: SearchEntityKey,
    documentId: string
  ): Promise<void> {
    this.assertEntityConfigured(entity)
    await this.engine.removeDocument(entity, documentId)
  }

  async reindexAll(
    entity: SearchEntityKey,
    dataSource: () => Promise<readonly SearchDocument[]>
  ): Promise<void> {
    this.assertEntityConfigured(entity)
    await this.engine.clearIndex(entity)
    await this.indexBatch(entity, await dataSource())
  }

  getIndexStats(entity: SearchEntityKey) {
    this.assertEntityConfigured(entity)
    return this.engine.getIndexStats(entity)
  }

  private assertEntityConfigured(entity: SearchEntityKey): void {
    if (!this.registry.has(entity)) {
      throw new Error(
        `No search index config registered for entity "${entity}".`
      )
    }
  }
}
