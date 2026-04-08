import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import {
  LEGACY_ACTION_BAR_PREFS_KEY,
  buildActionBarPrefsStorageKey,
} from './action-bar-prefs-key'

const PERSIST_VERSION = 2

/**
 * Per-scope ordered keys visible in Row 2. Absent scope → show every registered item (default).
 * Empty array → user explicitly hid all items for that scope.
 *
 * Prefs are stored **per tenant + user** (`prefsByContext`) so switching org or account does not
 * reset or cross-contaminate. Old flat `selectedKeysByScope` is migrated once into `__legacy__`
 * and copied into the first resolved context.
 */
export interface ActionBarPrefsState {
  /** Runtime only (not persisted): which bucket in `prefsByContext` is read/written. */
  activePrefsContextKey: string | null
  prefsByContext: Record<string, Record<string, string[]>>

  /**
   * Call when tenant and/or user identity is known (see `useSyncActionBarPrefsContext`).
   * Pulls forward one-time data from `__legacy__` when the new bucket is still empty.
   */
  setActivePrefsContext: (
    tenantId: string | null,
    userId: string | null,
  ) => void

  setSelectedKeys: (scopeKey: string, keys: string[]) => void
  clearScopeSelection: (scopeKey: string) => void

  /**
   * When the API returns saved prefs, merge them for this tenant+user (replaces that context’s map).
   */
  hydrateFromServer: (
    tenantId: string | null,
    userId: string | null,
    selectedKeysByScope: Record<string, string[]>,
  ) => void

  /** Stop targeting a context (e.g. after logout) until the next sync. */
  clearActivePrefsContext: () => void
}

const EMPTY_SCOPE_PREFS: Record<string, string[]> = {}

function getBucket(
  state: Pick<ActionBarPrefsState, 'activePrefsContextKey' | 'prefsByContext'>,
): Record<string, string[]> {
  const key = state.activePrefsContextKey
  if (!key) return EMPTY_SCOPE_PREFS
  return state.prefsByContext[key] ?? EMPTY_SCOPE_PREFS
}

export const useActionBarPrefsStore = create<ActionBarPrefsState>()(
  devtools(
    persist(
      (set, get) => ({
        activePrefsContextKey: null,
        prefsByContext: {},

        setActivePrefsContext: (tenantId, userId) => {
          const key = buildActionBarPrefsStorageKey(tenantId, userId)
          set((s) => {
            let next = { ...s.prefsByContext }
            const existing = next[key]
            const hasExisting =
              existing !== undefined && Object.keys(existing).length > 0
            const legacy = next[LEGACY_ACTION_BAR_PREFS_KEY]
            const hasLegacy =
              legacy !== undefined && Object.keys(legacy).length > 0

            if (!hasExisting && hasLegacy) {
              next[key] = { ...legacy }
              const { [LEGACY_ACTION_BAR_PREFS_KEY]: _, ...rest } = next
              next = rest
            }

            return {
              activePrefsContextKey: key,
              prefsByContext: next,
            }
          })
        },

        setSelectedKeys: (scopeKey, keys) => {
          const s = get()
          const ctx = s.activePrefsContextKey
          if (!ctx) return

          set((state) => {
            const prev = state.prefsByContext[ctx] ?? {}
            return {
              prefsByContext: {
                ...state.prefsByContext,
                [ctx]: { ...prev, [scopeKey]: keys },
              },
            }
          })
        },

        clearScopeSelection: (scopeKey) => {
          const s = get()
          const ctx = s.activePrefsContextKey
          if (!ctx) return

          set((state) => {
            const prev = state.prefsByContext[ctx] ?? {}
            const { [scopeKey]: _, ...rest } = prev
            return {
              prefsByContext: {
                ...state.prefsByContext,
                [ctx]: rest,
              },
            }
          })
        },

        hydrateFromServer: (tenantId, userId, selectedKeysByScope) => {
          const key = buildActionBarPrefsStorageKey(tenantId, userId)
          set((state) => ({
            prefsByContext: {
              ...state.prefsByContext,
              [key]: { ...selectedKeysByScope },
            },
            activePrefsContextKey: key,
          }))
        },

        clearActivePrefsContext: () => set({ activePrefsContextKey: null }),
      }),
      {
        name: 'afenda-action-bar-prefs',
        version: PERSIST_VERSION,
        partialize: (state) => ({
          prefsByContext: state.prefsByContext,
        }),
        migrate: (persisted, version) => {
          type PersistedSlice = Pick<ActionBarPrefsState, 'prefsByContext'>

          if (version >= PERSIST_VERSION) {
            return persisted as PersistedSlice
          }

          const p = persisted as {
            selectedKeysByScope?: Record<string, string[]>
            prefsByContext?: Record<string, Record<string, string[]>>
          }

          if (p.prefsByContext && typeof p.prefsByContext === 'object') {
            return { prefsByContext: p.prefsByContext }
          }

          const flat = p.selectedKeysByScope
          if (flat && typeof flat === 'object') {
            return {
              prefsByContext: {
                [LEGACY_ACTION_BAR_PREFS_KEY]: { ...flat },
              },
            }
          }

          return { prefsByContext: {} }
        },
      },
    ),
    { name: 'action-bar-prefs-store' },
  ),
)

/** Active tenant+user map for action-bar resolution (used by provider + customize UI). */
export function selectActiveActionBarPrefs(
  state: ActionBarPrefsState,
): Record<string, string[]> {
  return getBucket(state)
}
