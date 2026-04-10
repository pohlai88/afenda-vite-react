import type { ActionBarTab } from '@/share/types'

/**
 * Finance module Row-2 **catalog** (candidate tabs). Replace or merge from
 * server-driven module metadata when available; keep stable `key` values for prefs.
 *
 * @see `share/api/action-bar-prefs.api.stub.ts` — persisted visibility per tenant/user.
 */
export const FINANCE_TOP_ACTION_BAR_CATALOG: readonly ActionBarTab[] = [
  {
    key: 'overview',
    labelKey: 'finance_tabs.overview',
    path: '/app/finance',
    icon: 'LayoutDashboard',
  },
  {
    key: 'invoices',
    labelKey: 'finance_tabs.invoices',
    path: '/app/invoices',
    icon: 'FileText',
    badge: { value: '12 pending', severity: 'pending' },
  },
  {
    key: 'allocations',
    labelKey: 'finance_tabs.allocations',
    path: '/app/allocations',
    icon: 'Scale',
    badge: { value: 'imbalance', severity: 'warning' },
  },
  {
    key: 'settlements',
    labelKey: 'finance_tabs.settlements',
    path: '/app/settlements',
    icon: 'Banknote',
    badge: { value: '3 incomplete', severity: 'pending' },
  },
]
