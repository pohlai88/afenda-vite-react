import type { TruthSeverity } from '../truth/truth-status'

/**
 * TruthBadge represents a visual indicator for action bar tabs and other UI elements.
 * The severity determines the badge color via CSS tokens.
 */
export interface TruthBadge {
  /** Badge content (number or text like "!!" for imbalance) */
  readonly value: number | string
  /** Severity determines color via --color-truth-{severity} */
  readonly severity: TruthSeverity
}
