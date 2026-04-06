import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type { TruthScope } from '@afenda/core/truth'

/**
 * Organization entity for scope switching.
 */
export interface ScopeOrg {
  readonly id: string
  readonly name: string
  readonly slug: string
}

/**
 * Subsidiary/legal entity for scope switching.
 */
export interface ScopeSubsidiary {
  readonly id: string
  readonly name: string
  readonly orgId: string
  readonly legalEntityCode?: string
}

/**
 * Accounting period for scope switching.
 */
export interface ScopeAccountingPeriod {
  readonly id: string
  readonly name: string
  readonly startDate: string
  readonly endDate: string
  readonly status: 'open' | 'closing' | 'closed'
}

interface TruthScopeState {
  /** Current truth scope context */
  scope: TruthScope | null
  /** Available organizations for switching */
  orgList: readonly ScopeOrg[]
  /** Available subsidiaries for current org */
  subsidiaryList: readonly ScopeSubsidiary[]
  /** Available accounting periods for current subsidiary */
  periodList: readonly ScopeAccountingPeriod[]

  /** Update full or partial scope */
  setScope: (scope: Partial<TruthScope>) => void
  /** Switch to a different organization */
  switchOrg: (orgId: string) => void
  /** Switch to a different subsidiary */
  switchSubsidiary: (subsidiaryId: string) => void
  /** Switch to a different accounting period */
  switchPeriod: (periodId: string) => void
  /** Set available organizations */
  setOrgList: (orgs: readonly ScopeOrg[]) => void
  /** Set available subsidiaries */
  setSubsidiaryList: (subsidiaries: readonly ScopeSubsidiary[]) => void
  /** Set available accounting periods */
  setPeriodList: (periods: readonly ScopeAccountingPeriod[]) => void
  /** Clear scope (logout) */
  clearScope: () => void
}

export const useTruthScopeStore = create<TruthScopeState>()(
  devtools(
    persist(
      (set) => ({
        scope: null,
        orgList: [],
        subsidiaryList: [],
        periodList: [],

        setScope: (partial) =>
          set((state) => {
            if (state.scope) {
              return { scope: { ...state.scope, ...partial } }
            }
            if (
              partial.tenantId &&
              partial.legalEntityId &&
              partial.accountingPeriodId &&
              partial.reportingCurrency
            ) {
              return {
                scope: {
                  tenantId: partial.tenantId,
                  legalEntityId: partial.legalEntityId,
                  accountingPeriodId: partial.accountingPeriodId,
                  reportingCurrency: partial.reportingCurrency,
                },
              }
            }
            return { scope: null }
          }),

        switchOrg: (orgId) =>
          set((state) => ({
            scope: state.scope ? { ...state.scope, tenantId: orgId } : null,
          })),

        switchSubsidiary: (subsidiaryId) =>
          set((state) => ({
            scope: state.scope
              ? { ...state.scope, legalEntityId: subsidiaryId }
              : null,
          })),

        switchPeriod: (periodId) =>
          set((state) => ({
            scope: state.scope
              ? { ...state.scope, accountingPeriodId: periodId }
              : null,
          })),

        setOrgList: (orgs) => set({ orgList: orgs }),
        setSubsidiaryList: (subsidiaries) =>
          set({ subsidiaryList: subsidiaries }),
        setPeriodList: (periods) => set({ periodList: periods }),

        clearScope: () =>
          set({
            scope: null,
            orgList: [],
            subsidiaryList: [],
            periodList: [],
          }),
      }),
      {
        name: 'truth-scope-store',
        partialize: (state) => ({
          scope: state.scope,
        }),
      },
    ),
    { name: 'truth-scope-store' },
  ),
)
