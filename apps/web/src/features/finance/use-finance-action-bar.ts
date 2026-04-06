import type { TruthActionBarTab } from '@afenda/core/truth-ui'

import { useActionBar } from '@/share/components/providers'

/**
 * Finance module tabs for Row 2 (truth-aware badges mirror the navigation plan examples).
 * Registered on every finance route view so the strip remains visible across siblings.
 */
const FINANCE_ACTION_BAR_TABS: readonly TruthActionBarTab[] = [
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

export function useFinanceActionBar() {
  useActionBar(FINANCE_ACTION_BAR_TABS)
}
