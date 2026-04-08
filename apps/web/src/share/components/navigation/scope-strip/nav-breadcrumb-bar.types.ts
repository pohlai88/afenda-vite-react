import type { ComponentType, SVGProps } from 'react'

import type { TruthSeverity } from '@afenda/core/truth'

import type { ScopeSwitcherItem } from '../../block-ui'

/**
 * One scope level in the top-nav breadcrumb strip (tenant, legal entity, etc.).
 * Compose these in the shell (e.g. `TopNavBar`); this strip stays domain-agnostic.
 */
export interface NavBreadcrumbScopeLevel {
  readonly id: string
  /** Visible level label (caller runs i18n). */
  readonly label: string
  readonly searchPlaceholder: string
  readonly items: readonly ScopeSwitcherItem[]
  readonly currentValue: string | null
  readonly onSelect: (id: string) => void
  readonly severity?: TruthSeverity
  readonly icon?: ComponentType<SVGProps<SVGSVGElement>>
}
