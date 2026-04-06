import type { ReactNode } from 'react'

/** Normalized hit for global / semantic search lists and provider cache. */
export interface GlobalSearchResult {
  id: string
  /** Feature-owned category key; presentation comes from `SearchSuggestions` `getTypePresentation`. */
  type: string
  title: string
  subtitle?: string
  similarity?: number
  url: string
}

export interface RecentSearch {
  query: string
  timestamp: number
}

/** Last-executed palette command ids (not search query strings). */
export interface RecentCommand {
  commandId: string
  executedAt: number
}

/** User-pinned palette command ids. */
export interface PinnedCommand {
  commandId: string
  pinnedAt: number
}

export interface GlobalSearchContextValue {
  isCommandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void

  recentSearches: readonly RecentSearch[]
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void

  recentCommands: readonly RecentCommand[]
  addRecentCommand: (commandId: string) => void
  clearRecentCommands: () => void

  pinnedCommands: readonly PinnedCommand[]
  togglePinCommand: (commandId: string) => void
  isCommandPinned: (commandId: string) => boolean

  globalQuery: string
  setGlobalQuery: (query: string) => void

  setCachedResults: (
    query: string,
    results: readonly GlobalSearchResult[],
  ) => void
  getCachedResults: (query: string) => readonly GlobalSearchResult[] | undefined
}

export interface GlobalSearchProviderProps {
  readonly children: ReactNode
}

/** Caller-supplied row heading for a result `type` string. */
export interface SearchResultTypePresentation {
  label: string
  icon: ReactNode
  labelClassName?: string
}
