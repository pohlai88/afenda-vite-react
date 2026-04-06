import { useEffect, useRef } from 'react'

import {
  TRUTH_DEMO_ALERTS,
  TRUTH_DEMO_HEALTH,
  TRUTH_DEMO_ORGS,
  TRUTH_DEMO_SCOPE,
  TRUTH_DEMO_SUBSIDIARIES,
} from './truth-demo-seed'
import { useTruthHealthStore } from './use-truth-health-store'
import { useTruthScopeStore } from './use-truth-scope-store'

const SESSION_KEY = 'afenda.truth_demo_health_seeded'

/**
 * Bootstrap for the truth-aware shell when no API has populated stores yet.
 * Org/subs lists are not persisted — they are refilled whenever empty after a full reload.
 * Demo health + alerts are seeded at most once per browser tab session so mark-read isn’t wiped on navigation.
 */
export function useTruthShellBootstrap() {
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const scopeStore = useTruthScopeStore.getState()
    if (scopeStore.orgList.length === 0) {
      scopeStore.setOrgList(TRUTH_DEMO_ORGS)
      scopeStore.setSubsidiaryList(TRUTH_DEMO_SUBSIDIARIES)
    }

    const scopeAfter = useTruthScopeStore.getState()
    if (!scopeAfter.scope) {
      scopeAfter.setScope(TRUTH_DEMO_SCOPE)
    }

    const healthSeeded =
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(SESSION_KEY) === '1'

    if (!healthSeeded) {
      const healthStore = useTruthHealthStore.getState()
      if (healthStore.health === null && healthStore.alerts.length === 0) {
        healthStore.setHealth(TRUTH_DEMO_HEALTH)
        healthStore.addAlerts(TRUTH_DEMO_ALERTS)
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_KEY, '1')
      }
    }
  }, [])
}
