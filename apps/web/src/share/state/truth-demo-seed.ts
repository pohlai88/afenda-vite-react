import type {
  TruthHealthSummary,
  TruthScope,
  TruthStatus,
} from '@afenda/core/truth'
import type {
  ResolutionSuggestion,
  TruthAlertItem,
} from '@afenda/core/truth-ui'

import type { ScopeOrg, ScopeSubsidiary } from './use-truth-scope-store'

/** Demo tenant for local / pre-API shell development */
export const TRUTH_DEMO_ORG_ID = 'org-demo-afenda'
export const TRUTH_DEMO_LEGAL_ENTITY_ID = 'le-demo-sg'

export const TRUTH_DEMO_ORGS: readonly ScopeOrg[] = [
  {
    id: TRUTH_DEMO_ORG_ID,
    name: 'Afenda Demo Holdings',
    slug: 'afenda-demo',
  },
]

export const TRUTH_DEMO_SUBSIDIARIES: readonly ScopeSubsidiary[] = [
  {
    id: TRUTH_DEMO_LEGAL_ENTITY_ID,
    name: 'Afenda SG Pte Ltd',
    orgId: TRUTH_DEMO_ORG_ID,
    legalEntityCode: 'SG-01',
  },
  {
    id: 'le-demo-my',
    name: 'Afenda MY Sdn Bhd',
    orgId: TRUTH_DEMO_ORG_ID,
    legalEntityCode: 'MY-01',
  },
]

export const TRUTH_DEMO_SCOPE: TruthScope = {
  tenantId: TRUTH_DEMO_ORG_ID,
  legalEntityId: TRUTH_DEMO_LEGAL_ENTITY_ID,
  accountingPeriodId: '2026-Q1',
  reportingCurrency: 'USD',
}

const DEMO_GLOBAL_WARNING: TruthStatus = {
  severity: 'warning',
  priority: 80,
  scopeImpact: 'global',
  invariantKey: 'consolidation.fx_missing',
  message: 'Missing FX rate for MYR→USD on 2026-04-01',
  doctrineRef: 'doctrine/fx/valuation',
  resolution: {
    key: 'add_fx_rate_myr_usd',
    type: 'manual',
    actionPath: '/app/finance',
  },
}

const DEMO_ENTITY_FAILURE: TruthStatus = {
  severity: 'broken',
  priority: 100,
  scopeImpact: 'entity',
  invariantKey: 'allocation.balance',
  message: 'Allocation batch #4412 does not sum to invoice total',
  doctrineRef: 'doctrine/ar/allocation',
  entityRefs: ['inv-10042'],
  resolution: {
    key: 'rebalance_allocation',
    type: 'assisted',
    actionPath: '/app/allocations',
  },
}

export const TRUTH_DEMO_HEALTH: TruthHealthSummary = {
  integrityScore: 94,
  invariantFailures: [DEMO_ENTITY_FAILURE],
  warnings: [DEMO_GLOBAL_WARNING],
  lastReconciliation: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
}

export const TRUTH_DEMO_ALERTS: readonly TruthAlertItem[] = [
  {
    id: 'alert-fx-1',
    invariantKey: 'consolidation.fx_missing',
    severity: 'warning',
    priority: 80,
    title: 'Missing FX rate',
    description:
      'Consolidation cannot value MYR subsidiary balances without a MYR→USD rate for 2026-04-01.',
    doctrineRef: 'doctrine/fx/valuation',
    resolution: {
      key: 'add_fx_rate_myr_usd',
      type: 'manual',
      actionPath: '/app/finance',
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    category: 'financial_integrity',
    read: false,
  },
  {
    id: 'alert-alloc-1',
    invariantKey: 'allocation.balance',
    severity: 'broken',
    priority: 100,
    title: 'Allocation imbalance',
    description:
      'Invoice INV-10042 lines do not match allocated amounts in batch #4412.',
    doctrineRef: 'doctrine/ar/allocation',
    entityRefs: ['inv-10042'],
    resolution: {
      key: 'rebalance_allocation',
      type: 'assisted',
      actionPath: '/app/allocations',
    },
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    category: 'invariant',
    read: false,
  },
  {
    id: 'alert-sys-1',
    invariantKey: 'integration.queue_lag',
    severity: 'pending',
    priority: 30,
    title: 'Bank feed sync delayed',
    description: 'Last successful import was 18 minutes ago (SLA: 15m).',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    category: 'system',
    read: true,
  },
]

export const TRUTH_DEMO_RESOLUTIONS: readonly ResolutionSuggestion[] = [
  {
    id: 'res-fx-1',
    problemKey: 'consolidation.fx_missing',
    description: 'MYR→USD rate missing for fiscal 2026-04-01',
    suggestedAction: 'Add daily rate MYR→USD for 2026-04-01 in the rate table.',
    confidence: 0.95,
    doctrineRef: 'doctrine/fx/valuation',
    resolution: {
      key: 'add_fx_rate_myr_usd',
      type: 'manual',
      actionPath: '/app/finance',
    },
  },
  {
    id: 'res-alloc-1',
    problemKey: 'allocation.balance',
    description:
      'Allocated lines total 12,400.00 but invoice subtotal is 12,500.00.',
    suggestedAction:
      'Open allocation workspace and distribute the remaining 100.00 across eligible lines.',
    confidence: 0.88,
    doctrineRef: 'doctrine/ar/allocation',
    resolution: {
      key: 'rebalance_allocation',
      type: 'assisted',
      actionPath: '/app/allocations',
    },
  },
]
