/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  GlobalSearchContextValue,
  GlobalSearchProviderProps,
  GlobalSearchResult,
  PinnedCommand,
  RecentCommand,
  RecentSearch,
} from './global-search-provider.types'

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

const MAX_RECENT_SEARCHES = 10
const MAX_RECENT_COMMANDS = 10
const MAX_PINNED_COMMANDS = 20
const MAX_CACHE_ENTRIES = 50
const RECENT_SEARCHES_STORAGE_KEY = 'afenda.recent_searches.v1'
const RECENT_COMMANDS_STORAGE_KEY = 'afenda.recent_commands.v1'
const PINNED_COMMANDS_STORAGE_KEY = 'afenda.pinned_commands.v1'
const LEGACY_RECENT_COMMANDS_STORAGE_KEY = 'afenda.recent_palette_commands.v1'
const LEGACY_PINNED_COMMANDS_STORAGE_KEY = 'afenda.pinned_palette_commands.v1'

function loadRecentFromStorage(): RecentSearch[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (row): row is RecentSearch =>
          row !== null &&
          typeof row === 'object' &&
          typeof (row as RecentSearch).query === 'string' &&
          typeof (row as RecentSearch).timestamp === 'number',
      )
      .slice(0, MAX_RECENT_SEARCHES)
  } catch {
    return []
  }
}

function persistRecent(searches: readonly RecentSearch[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify([...searches].slice(0, MAX_RECENT_SEARCHES)),
    )
  } catch {
    // Quota or private mode
  }
}

function loadRecentCommands(): RecentCommand[] {
  if (typeof window === 'undefined') return []
  try {
    const raw =
      window.localStorage.getItem(RECENT_COMMANDS_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_RECENT_COMMANDS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (row): row is RecentCommand =>
          row !== null &&
          typeof row === 'object' &&
          typeof (row as RecentCommand).commandId === 'string' &&
          typeof (row as RecentCommand).executedAt === 'number',
      )
      .slice(0, MAX_RECENT_COMMANDS)
  } catch {
    return []
  }
}

function persistRecentCommands(rows: readonly RecentCommand[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      RECENT_COMMANDS_STORAGE_KEY,
      JSON.stringify([...rows].slice(0, MAX_RECENT_COMMANDS)),
    )
  } catch {
    // Quota or private mode
  }
}

function loadPinnedCommands(): PinnedCommand[] {
  if (typeof window === 'undefined') return []
  try {
    const raw =
      window.localStorage.getItem(PINNED_COMMANDS_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_PINNED_COMMANDS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (row): row is PinnedCommand =>
          row !== null &&
          typeof row === 'object' &&
          typeof (row as PinnedCommand).commandId === 'string' &&
          typeof (row as PinnedCommand).pinnedAt === 'number',
      )
      .slice(0, MAX_PINNED_COMMANDS)
  } catch {
    return []
  }
}

function persistPinnedCommands(rows: readonly PinnedCommand[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      PINNED_COMMANDS_STORAGE_KEY,
      JSON.stringify([...rows].slice(0, MAX_PINNED_COMMANDS)),
    )
  } catch {
    // Quota or private mode
  }
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const [isCommandPaletteOpen, setCommandPaletteOpenState] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(
    loadRecentFromStorage,
  )
  const [recentCommands, setRecentCommands] =
    useState<RecentCommand[]>(loadRecentCommands)
  const [pinnedCommands, setPinnedCommands] =
    useState<PinnedCommand[]>(loadPinnedCommands)
  const [globalQuery, setGlobalQuery] = useState('')
  const cachedResultsRef = useRef(new Map<string, GlobalSearchResult[]>())

  const setCommandPaletteOpen = useCallback((open: boolean) => {
    setCommandPaletteOpenState(open)
  }, [])

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpenState(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpenState(false)
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpenState((prev) => !prev)
  }, [])

  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.query.toLowerCase() !== trimmed.toLowerCase(),
      )
      const next: RecentSearch[] = [
        { query: trimmed, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES)
      persistRecent(next)
      return next
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    persistRecent([])
  }, [])

  const addRecentCommand = useCallback((commandId: string) => {
    const id = commandId.trim()
    if (!id) return

    setRecentCommands((prev) => {
      const filtered = prev.filter((row) => row.commandId !== id)
      const next: RecentCommand[] = [
        { commandId: id, executedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_COMMANDS)
      persistRecentCommands(next)
      return next
    })
  }, [])

  const clearRecentCommands = useCallback(() => {
    setRecentCommands([])
    persistRecentCommands([])
  }, [])

  const togglePinCommand = useCallback((commandId: string) => {
    const id = commandId.trim()
    if (!id) return

    setPinnedCommands((prev) => {
      const exists = prev.some((p) => p.commandId === id)
      const next: PinnedCommand[] = exists
        ? prev.filter((p) => p.commandId !== id)
        : [
            { commandId: id, pinnedAt: Date.now() },
            ...prev.filter((p) => p.commandId !== id),
          ].slice(0, MAX_PINNED_COMMANDS)
      persistPinnedCommands(next)
      return next
    })
  }, [])

  const isCommandPinned = useCallback(
    (commandId: string) =>
      pinnedCommands.some((p) => p.commandId === commandId),
    [pinnedCommands],
  )

  const setCachedResults = useCallback(
    (query: string, results: readonly GlobalSearchResult[]) => {
      const key = query.toLowerCase()
      const map = cachedResultsRef.current
      map.set(key, [...results])
      while (map.size > MAX_CACHE_ENTRIES) {
        const first = map.keys().next().value
        if (first === undefined) break
        map.delete(first)
      }
    },
    [],
  )

  const getCachedResults = useCallback((query: string) => {
    return cachedResultsRef.current.get(query.toLowerCase())
  }, [])

  const value = useMemo<GlobalSearchContextValue>(
    () => ({
      isCommandPaletteOpen,
      setCommandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      recentCommands,
      addRecentCommand,
      clearRecentCommands,
      pinnedCommands,
      togglePinCommand,
      isCommandPinned,
      globalQuery,
      setGlobalQuery,
      setCachedResults,
      getCachedResults,
    }),
    [
      isCommandPaletteOpen,
      setCommandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      recentCommands,
      addRecentCommand,
      clearRecentCommands,
      pinnedCommands,
      togglePinCommand,
      isCommandPinned,
      globalQuery,
      setCachedResults,
      getCachedResults,
    ],
  )

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearch(): GlobalSearchContextValue {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider')
  }
  return ctx
}

export function useGlobalSearchOptional(): GlobalSearchContextValue | null {
  return useContext(GlobalSearchContext)
}
