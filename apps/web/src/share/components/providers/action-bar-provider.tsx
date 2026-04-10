/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

import type { ActionBarTab } from '@/share/types'

import {
  selectActiveActionBarPrefs,
  useActionBarPrefsStore,
} from '@/share/client-store'

import { resolveEffectiveActionBarTabs } from './action-bar-effective-tabs'
import type {
  ActionBarContextValue,
  ActionBarProviderProps,
  UseActionBarOptions,
} from './action-bar-provider.types'

const EMPTY_TABS: readonly ActionBarTab[] = []

const ActionBarContext = createContext<ActionBarContextValue | null>(null)

interface Registration {
  readonly scopeKey: string
  readonly tabs: readonly ActionBarTab[]
}

/**
 * ActionBarProvider manages Row 2: available actions per scope and user visibility prefs.
 * Module views register a catalog via `useActionBar({ scopeKey, tabs })`.
 */
export function ActionBarProvider({ children }: ActionBarProviderProps) {
  const [registration, setRegistration] = useState<Registration | null>(null)

  const selectedKeysByScope = useActionBarPrefsStore(selectActiveActionBarPrefs)

  const displayTabs = useMemo(() => {
    if (!registration) return EMPTY_TABS
    return resolveEffectiveActionBarTabs(
      registration.tabs,
      registration.scopeKey,
      selectedKeysByScope,
    )
  }, [registration, selectedKeysByScope])

  const registerScope = useCallback(
    (scopeKey: string, tabs: readonly ActionBarTab[]) => {
      setRegistration({ scopeKey, tabs })
    },
    [],
  )

  const clearScope = useCallback(() => {
    setRegistration(null)
  }, [])

  const value = useMemo<ActionBarContextValue>(
    () => ({
      tabs: displayTabs,
      availableTabs: registration?.tabs ?? EMPTY_TABS,
      scopeKey: registration?.scopeKey ?? null,
      registerScope,
      clearScope,
    }),
    [displayTabs, registration, registerScope, clearScope],
  )

  return (
    <ActionBarContext.Provider value={value}>
      {children}
    </ActionBarContext.Provider>
  )
}

/**
 * Module views register the **catalog** of actions the user may show in Row 2.
 * Selection defaults to **all** until the user changes prefs (persisted).
 */
export function useActionBar({ scopeKey, tabs }: UseActionBarOptions): void {
  const context = useContext(ActionBarContext)
  const registerScope = context?.registerScope
  const clearScope = context?.clearScope

  useLayoutEffect(() => {
    registerScope?.(scopeKey, tabs)
    return () => clearScope?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- badge updates use same keys
  }, [registerScope, clearScope, scopeKey, JSON.stringify(tabs)])
}

/**
 * Shell chrome (action bar UI) consumes this hook.
 */
export function useActionBarContext(): ActionBarContextValue {
  const context = useContext(ActionBarContext)

  if (!context) {
    throw new Error('useActionBarContext must be used within ActionBarProvider')
  }

  return context
}
