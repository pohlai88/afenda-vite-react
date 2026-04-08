import { useActionBar } from '@/share/components/providers'

import { FINANCE_TOP_ACTION_BAR_CATALOG } from '../catalog/finance-action-bar.catalog'

const FINANCE_ACTION_BAR_SCOPE_KEY = 'module:finance' as const

/** Registers the finance top action bar catalog for Row 2. */
export function useFinanceActionBar() {
  useActionBar({
    scopeKey: FINANCE_ACTION_BAR_SCOPE_KEY,
    tabs: FINANCE_TOP_ACTION_BAR_CATALOG,
  })
}
