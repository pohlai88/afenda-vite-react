import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@afenda/ui/lib/utils'

import type {
  GlobalSearchResult,
  SearchResultTypePresentation,
} from '@/share/components/providers/global-search-provider.types'
import { useGlobalSearch } from '@/share/components/providers'

import { SearchOverlayShell } from './search-overlay-shell'
import { SearchSuggestions } from './search-suggestions'
import { SemanticSearchInput } from './semantic-search-input'

export interface GlobalSearchBarProps {
  className?: string
  /** Passed to {@link SemanticSearchInput} `InputGroup` (top nav density). */
  searchInputClassName?: string
  /** Debounced text query; return hits (e.g. nav, API, index). */
  fetchResults: (query: string) => Promise<readonly GlobalSearchResult[]>
  getTypePresentation: (
    type: string,
  ) => SearchResultTypePresentation | undefined
  debounceMs?: number
  maxSuggestions?: number
  /** Optional id for the text field (forms / a11y). */
  inputId?: string
}

/**
 * Real search field: typed query, debounced fetch, dropdown suggestions — **not** the cmdk palette.
 * Requires `GlobalSearchProvider`. Pair with {@link CommandPalette} + shortcut for command mode.
 */
export function GlobalSearchBar({
  fetchResults,
  getTypePresentation,
  className,
  searchInputClassName,
  debounceMs = 300,
  maxSuggestions = 8,
  inputId,
}: GlobalSearchBarProps) {
  const { t } = useTranslation('shell')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { globalQuery, setGlobalQuery, setCachedResults, addRecentSearch } =
    useGlobalSearch()

  const [results, setResults] = useState<readonly GlobalSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)

  const trimmedQuery = globalQuery.trim()
  const panelOpen = trimmedQuery.length > 0

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([])
      setSearchError(false)
    }
  }, [trimmedQuery])

  const runSearch = useCallback(
    async (q: string) => {
      const tq = q.trim()
      if (!tq) {
        setResults([])
        return
      }
      setIsLoading(true)
      setSearchError(false)
      try {
        const hits = await fetchResults(tq)
        const list = [...hits]
        setResults(list)
        setCachedResults(tq, list)
      } catch {
        setResults([])
        setSearchError(true)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchResults, setCachedResults],
  )

  const handleSearch = useCallback(
    (q: string) => {
      void runSearch(q)
    },
    [runSearch],
  )

  const handleSelect = useCallback(
    (_hit: GlobalSearchResult) => {
      if (trimmedQuery) addRecentSearch(trimmedQuery)
      setGlobalQuery('')
      setResults([])
    },
    [addRecentSearch, setGlobalQuery, trimmedQuery],
  )

  const keyboardScopeRef: RefObject<HTMLElement | null> = wrapperRef

  return (
    <div
      ref={wrapperRef}
      className={cn('relative w-full max-w-xl min-w-0', className)}
    >
      <SemanticSearchInput
        id={inputId}
        value={globalQuery}
        onChange={setGlobalQuery}
        onSearch={handleSearch}
        debounceMs={debounceMs}
        showSemanticIndicator={false}
        className={searchInputClassName}
      />
      {panelOpen ? (
        isLoading ? (
          <SearchSuggestions
            results={[]}
            keyboardScopeRef={keyboardScopeRef}
            active={panelOpen}
            getTypePresentation={getTypePresentation}
            isLoading
            maxResults={maxSuggestions}
          />
        ) : searchError ? (
          <SearchOverlayShell
            className="px-3 py-2 text-sm text-muted-foreground"
            role="alert"
          >
            {t('global_search.error')}
          </SearchOverlayShell>
        ) : results.length > 0 ? (
          <SearchSuggestions
            results={results}
            keyboardScopeRef={keyboardScopeRef}
            active={panelOpen}
            getTypePresentation={getTypePresentation}
            onSelect={handleSelect}
            maxResults={maxSuggestions}
          />
        ) : (
          <SearchOverlayShell className="px-3 py-2 text-sm text-muted-foreground">
            {t('global_search.no_results')}
          </SearchOverlayShell>
        )
      ) : null}
    </div>
  )
}
