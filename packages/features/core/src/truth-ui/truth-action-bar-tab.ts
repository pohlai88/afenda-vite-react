import type { TruthBadge } from './truth-badge'

/**
 * TruthActionBarTab describes one candidate action in the Row 2 action bar catalog.
 * Modules register a list per `scopeKey`; the shell shows all by default unless the
 * user hides items (persisted prefs). `key` must be stable within that scope.
 *
 * Example tabs for Finance module:
 * - Overview (no badge)
 * - Invoices (badge: 12 pending, severity: pending)
 * - Allocations (badge: "!!", severity: warning)
 * - Reconciliation (badge: "X", severity: broken)
 */
export interface TruthActionBarTab {
  /** Unique tab identifier */
  readonly key: string
  /** i18n key for the tab label */
  readonly labelKey: string
  /** Navigation path */
  readonly path: string
  /** Lucide icon name */
  readonly icon: string
  /** Optional truth-aware badge with severity coloring */
  readonly badge?: TruthBadge
  /** Whether this tab is currently active */
  readonly isActive?: boolean
}
