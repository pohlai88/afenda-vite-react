import type { ReactNode } from 'react'

import type { TruthActionBarTab } from '@afenda/core/truth-ui'

/**
 * Context value for the action bar provider.
 */
export interface ActionBarContextValue {
  /** Currently registered tabs */
  readonly tabs: readonly TruthActionBarTab[]
  /** Register tabs for the current module view */
  registerTabs: (tabs: readonly TruthActionBarTab[]) => void
  /** Clear all registered tabs */
  clearTabs: () => void
}

/**
 * Props for the ActionBarProvider component.
 */
export interface ActionBarProviderProps {
  readonly children: ReactNode
}
