import type {
  SearchEngine,
  SearchEntityKey,
  SearchModuleKey,
  SearchQuery,
  SearchResult,
  SearchSuggestion,
} from "./search.contract"

const moduleEntityMap: Readonly<
  Record<SearchModuleKey, readonly SearchEntityKey[]>
> = {
  crm: ["customer", "lead"],
  inventory: ["product"],
  sales: ["order"],
  accounting: ["invoice"],
  hr: ["employee"],
  project_management: ["project", "task"],
  production: ["production_order"],
  document_management: ["document"],
}

export class SearchClientService {
  constructor(private readonly engine: SearchEngine) {}

  search(query: SearchQuery): Promise<readonly SearchResult[]> {
    return this.engine.search(query)
  }

  searchModule(
    module: SearchModuleKey,
    query: string,
    options: Omit<Partial<SearchQuery>, "query" | "modules" | "entities"> = {}
  ): Promise<readonly SearchResult[]> {
    return this.engine.search({
      query,
      entities: moduleEntityMap[module],
      limit: options.limit,
      offset: options.offset,
      filters: options.filters,
      sort: options.sort,
    })
  }

  suggest(query: string, limit?: number): Promise<readonly SearchSuggestion[]> {
    return this.engine.suggest(query, limit)
  }
}
