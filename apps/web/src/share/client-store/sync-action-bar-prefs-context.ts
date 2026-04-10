import { useEffect } from 'react'

import { useAppShellStore } from './app-shell-store'
import { useActionBarPrefsStore } from './action-bar-prefs-store'

/**
 * Binds action-bar prefs to **user** so choices survive refresh.
 * When operational scope (tenant) is reintroduced, pass tenant id here again.
 */
export function useSyncActionBarPrefsContext(): void {
  const userId = useAppShellStore((s) => s.currentUser?.id ?? null)
  const setActivePrefsContext = useActionBarPrefsStore(
    (s) => s.setActivePrefsContext,
  )

  useEffect(() => {
    setActivePrefsContext(null, userId)
  }, [userId, setActivePrefsContext])
}
