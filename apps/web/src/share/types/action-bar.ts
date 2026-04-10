import type { ShellIntegritySeverity } from '@afenda/shadcn-ui/semantic'

/** Badge on a tab in the row-2 module action bar. */
export interface ActionBarBadge {
  readonly value: number | string
  readonly severity: ShellIntegritySeverity
}

/** One candidate tab in the row-2 action bar catalog (per scope key). */
export interface ActionBarTab {
  readonly key: string
  readonly labelKey: string
  readonly path: string
  readonly icon: string
  readonly badge?: ActionBarBadge
  readonly isActive?: boolean
}
