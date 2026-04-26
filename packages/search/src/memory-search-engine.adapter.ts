import type {
  SearchDocument,
  SearchEngine,
  SearchEntityKey,
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchSuggestion,
} from "./search.contract"

export class MemorySearchEngineAdapter implements SearchEngine {
  private readonly documentsByEntity = new Map<
    SearchEntityKey,
    Map<string, SearchDocument>
  >()

  async search(query: SearchQuery): Promise<readonly SearchResult[]> {
    const normalizedQuery = query.query.trim().toLowerCase()
    const limit = query.limit ?? 20
    const offset = query.offset ?? 0
    const entities = query.entities
    const modules = query.modules
    const filters = query.filters ?? []

    const results = this.getAllDocuments()
      .filter((document) => {
        if (entities && !entities.includes(document.entity)) {
          return false
        }
        if (modules && !modules.includes(document.module)) {
          return false
        }
        if (!matchesAllFilters(document, filters)) {
          return false
        }
        if (normalizedQuery.length === 0) {
          return true
        }
        return buildSearchHaystack(document).includes(normalizedQuery)
      })
      .map((document) => toSearchResult(document, normalizedQuery))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }
        return left.title.localeCompare(right.title)
      })

    return results.slice(offset, offset + limit)
  }

  async suggest(
    query: string,
    limit = 10
  ): Promise<readonly SearchSuggestion[]> {
    const normalizedQuery = query.trim().toLowerCase()
    const grouped = new Map<string, SearchSuggestion>()

    for (const document of this.getAllDocuments()) {
      if (
        normalizedQuery.length > 0 &&
        !buildSearchHaystack(document).includes(normalizedQuery)
      ) {
        continue
      }

      const key = `${document.entity}:${document.title}`
      const current = grouped.get(key)
      if (current) {
        grouped.set(key, {
          ...current,
          count: current.count + 1,
        })
        continue
      }

      grouped.set(key, {
        query: document.title,
        entity: document.entity,
        module: document.module,
        count: 1,
      })
    }

    return [...grouped.values()]
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count
        }
        return left.query.localeCompare(right.query)
      })
      .slice(0, limit)
  }

  async indexDocument(
    entity: SearchEntityKey,
    document: SearchDocument
  ): Promise<void> {
    const bucket = this.documentsByEntity.get(entity) ?? new Map()
    bucket.set(document.id, document)
    this.documentsByEntity.set(entity, bucket)
  }

  async indexBatch(
    entity: SearchEntityKey,
    documents: readonly SearchDocument[]
  ): Promise<void> {
    const bucket = this.documentsByEntity.get(entity) ?? new Map()
    for (const document of documents) {
      bucket.set(document.id, document)
    }
    this.documentsByEntity.set(entity, bucket)
  }

  async removeDocument(
    entity: SearchEntityKey,
    documentId: string
  ): Promise<void> {
    this.documentsByEntity.get(entity)?.delete(documentId)
  }

  async clearIndex(entity: SearchEntityKey): Promise<void> {
    this.documentsByEntity.set(entity, new Map())
  }

  async getIndexStats(entity: SearchEntityKey): Promise<{
    readonly numberOfDocuments: number
  }> {
    return {
      numberOfDocuments: this.documentsByEntity.get(entity)?.size ?? 0,
    }
  }

  private getAllDocuments(): readonly SearchDocument[] {
    return [...this.documentsByEntity.values()].flatMap((bucket) => [
      ...bucket.values(),
    ])
  }
}

function buildSearchHaystack(document: SearchDocument): string {
  return [
    document.title,
    document.description,
    document.id,
    ...Object.values(document.metadata).map((value) => String(value)),
  ]
    .join(" ")
    .toLowerCase()
}

function matchesAllFilters(
  document: SearchDocument,
  filters: readonly SearchFilter[]
): boolean {
  for (const filter of filters) {
    const value = resolveFilterValue(document, filter.field)
    if (Array.isArray(filter.value)) {
      if (!filter.value.includes(value as never)) {
        return false
      }
      continue
    }

    if (value !== filter.value) {
      return false
    }
  }

  return true
}

function resolveFilterValue(document: SearchDocument, field: string): unknown {
  if (field in document) {
    return document[field as keyof SearchDocument]
  }
  return document.metadata[field]
}

function toSearchResult(
  document: SearchDocument,
  normalizedQuery: string
): SearchResult {
  const haystack = buildSearchHaystack(document)
  const score =
    normalizedQuery.length === 0 ? 1 : computeScore(document, normalizedQuery)
  return {
    id: document.id,
    entity: document.entity,
    module: document.module,
    title: document.title,
    description: document.description,
    url: document.url,
    score,
    highlights:
      normalizedQuery.length === 0
        ? []
        : buildHighlights(document, normalizedQuery, haystack),
    metadata: document.metadata,
  }
}

function computeScore(
  document: SearchDocument,
  normalizedQuery: string
): number {
  const title = document.title.toLowerCase()
  const description = document.description.toLowerCase()
  let score = 0
  if (title.includes(normalizedQuery)) {
    score += 10
  }
  if (description.includes(normalizedQuery)) {
    score += 4
  }
  for (const value of Object.values(document.metadata)) {
    if (String(value).toLowerCase().includes(normalizedQuery)) {
      score += 2
    }
  }
  return score
}

function buildHighlights(
  document: SearchDocument,
  normalizedQuery: string,
  haystack: string
): readonly { field: string; snippet: string }[] {
  const highlights: { field: string; snippet: string }[] = []
  if (document.title.toLowerCase().includes(normalizedQuery)) {
    highlights.push({
      field: "title",
      snippet: document.title,
    })
  }
  if (document.description.toLowerCase().includes(normalizedQuery)) {
    highlights.push({
      field: "description",
      snippet: document.description,
    })
  }
  if (highlights.length === 0 && haystack.includes(normalizedQuery)) {
    highlights.push({
      field: "metadata",
      snippet: document.title,
    })
  }
  return highlights
}
