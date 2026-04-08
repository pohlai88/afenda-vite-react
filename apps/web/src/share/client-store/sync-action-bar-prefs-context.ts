import { useEffect } from 'react'

import { useAppShellStore } from './app-shell-store'
import { useActionBarPrefsStore } from './action-bar-prefs-store'
import { useTruthScopeStore } from './truth-scope-store'

/**
 * Binds action-bar prefs to **tenant + user** so choices survive refresh and do not
 * bleed across orgs or accounts. Run inside authenticated ERP shell (e.g. `ErpLayoutChrome`).
 */
export function useSyncActionBarPrefsContext(): void {
  const tenantId = useTruthScopeStore((s) => s.scope?.tenantId ?? null)
  const userId = useAppShellStore((s) => s.currentUser?.id ?? null)
  const setActivePrefsContext = useActionBarPrefsStore(
    (s) => s.setActivePrefsContext,
  )

  useEffect(() => {
    setActivePrefsContext(tenantId, userId)
  }, [tenantId, userId, setActivePrefsContext])
}
