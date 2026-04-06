/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

import type { TruthActionBarTab } from '@afenda/core/truth-ui'

import type {
  ActionBarContextValue,
  ActionBarProviderProps,
} from './action-bar-provider.types'

const EMPTY_TABS: readonly TruthActionBarTab[] = []

const ActionBarContext = createContext<ActionBarContextValue | null>(null)

/**
 * ActionBarProvider manages the Row 2 action bar tabs.
 * Module pages register their tabs via useActionBar(), and
 * the action bar component consumes them via useActionBarContext().
 */
export function ActionBarProvider({ children }: ActionBarProviderProps) {
  const [tabs, setTabs] = useState<readonly TruthActionBarTab[]>(EMPTY_TABS)

  const registerTabs = useCallback((newTabs: readonly TruthActionBarTab[]) => {
    setTabs(newTabs)
  }, [])

  const clearTabs = useCallback(() => {
    setTabs(EMPTY_TABS)
  }, [])

  const value = useMemo<ActionBarContextValue>(
    () => ({ tabs, registerTabs, clearTabs }),
    [tabs, registerTabs, clearTabs],
  )

  return (
    <ActionBarContext.Provider value={value}>
      {children}
    </ActionBarContext.Provider>
  )
}

/**
 * Module-level views call this hook to register their action bar tabs.
 * Tabs are cleared on unmount.
 *
 * @example
 * useActionBar([
 *   { key: 'overview', labelKey: 'finance.tabs.overview', path: '/app/finance', icon: 'Wallet' },
 *   { key: 'invoices', labelKey: 'finance.tabs.invoices', path: '/app/finance/invoices', icon: 'FileText', badge: { value: 12, severity: 'pending' } },
 * ])
 */
export function useActionBar(tabs: readonly TruthActionBarTab[]) {
  const context = useContext(ActionBarContext)
  const registerTabs = context?.registerTabs
  const clearTabs = context?.clearTabs

  useLayoutEffect(() => {
    registerTabs?.(tabs)
    return () => clearTabs?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerTabs, clearTabs, JSON.stringify(tabs)])
}

/**
 * Shell chrome components (action bar) consume tabs through this hook.
 */
export function useActionBarContext() {
  const context = useContext(ActionBarContext)

  if (!context) {
    throw new Error('useActionBarContext must be used within ActionBarProvider')
  }

  return context
}
