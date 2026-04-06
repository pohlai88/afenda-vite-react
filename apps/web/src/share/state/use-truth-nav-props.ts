import { useMemo } from 'react'

import type { TruthHealthSummary, TruthSeverity } from '@afenda/core/truth'
import type {
  ResolutionSuggestion,
  TruthAlertItem,
} from '@afenda/core/truth-ui'
import { getHighestSeverity } from '@afenda/core/truth-ui'

import { TRUTH_DEMO_RESOLUTIONS } from './truth-demo-seed'
import { useTruthShellBootstrap } from './use-truth-shell-bootstrap'
import { useTruthHealthStore } from './use-truth-health-store'

export interface TruthNavProps {
  healthSummary: TruthHealthSummary | null
  alerts: readonly TruthAlertItem[]
  resolutions: readonly ResolutionSuggestion[]
  orgSeverity?: TruthSeverity
  subsidiarySeverity?: TruthSeverity
}

/**
 * Subscribes to truth stores and maps them to `TopNavBar` props.
 * Runs the one-time demo bootstrap for empty stores (pre-API).
 */
export function useTruthNavProps(): TruthNavProps {
  useTruthShellBootstrap()

  const health = useTruthHealthStore((s) => s.health)
  const alerts = useTruthHealthStore((s) => s.alerts)

  return useMemo(() => {
    const orgStatuses = health
      ? [
          ...health.invariantFailures.filter((x) => x.scopeImpact === 'global'),
          ...health.warnings.filter((x) => x.scopeImpact === 'global'),
        ]
      : []
    const entityStatuses = health
      ? [
          ...health.invariantFailures.filter((x) => x.scopeImpact === 'entity'),
          ...health.warnings.filter((x) => x.scopeImpact === 'entity'),
        ]
      : []

    return {
      healthSummary: health,
      alerts,
      resolutions: TRUTH_DEMO_RESOLUTIONS,
      orgSeverity:
        orgStatuses.length > 0 ? getHighestSeverity(orgStatuses) : undefined,
      subsidiarySeverity:
        entityStatuses.length > 0
          ? getHighestSeverity(entityStatuses)
          : undefined,
    }
  }, [health, alerts])
}
