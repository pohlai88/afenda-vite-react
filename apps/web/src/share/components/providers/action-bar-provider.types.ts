import type { ReactNode } from 'react'

import type { TruthActionBarTab } from '@afenda/core/truth-ui'

/**
 * Context value for the action bar provider.
 */
export interface ActionBarContextValue {
  /** Tabs after user visibility prefs (what Row 2 renders as links). */
  readonly tabs: readonly TruthActionBarTab[]
  /** Full catalog for the active scope (module-offered actions). */
  readonly availableTabs: readonly TruthActionBarTab[]
  /** Active registration scope, or null when nothing registered. */
  readonly scopeKey: string | null
  readonly registerScope: (
    scopeKey: string,
    tabs: readonly TruthActionBarTab[],
  ) => void
  readonly clearScope: () => void
}

/**
 * Props for the ActionBarProvider component.
 */
export interface ActionBarProviderProps {
  readonly children: ReactNode
}

/**
 * Register module-offered action bar items for the current view.
 * `scopeKey` isolates saved user choices (e.g. `module:finance`).
 */
export interface UseActionBarOptions {
  readonly scopeKey: string
  readonly tabs: readonly TruthActionBarTab[]
}
