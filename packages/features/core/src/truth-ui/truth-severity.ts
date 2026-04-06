import type { TruthSeverity } from '../truth/truth-status'

/**
 * Maps TruthSeverity to CSS custom property names.
 * These tokens are defined in apps/web/src/index.css.
 */
export const TRUTH_SEVERITY_CSS_VAR = {
  valid: '--color-truth-valid',
  warning: '--color-truth-warning',
  broken: '--color-truth-broken',
  pending: '--color-truth-pending',
  neutral: '--color-truth-neutral',
} as const satisfies Record<TruthSeverity, string>

/**
 * Maps TruthSeverity to foreground CSS custom property names.
 */
export const TRUTH_SEVERITY_FOREGROUND_CSS_VAR = {
  valid: '--color-truth-valid-foreground',
  warning: '--color-truth-warning-foreground',
  broken: '--color-truth-broken-foreground',
  pending: '--color-truth-pending-foreground',
  neutral: '--color-truth-neutral-foreground',
} as const satisfies Record<TruthSeverity, string>

/**
 * Default sort order for severity (broken first, then warning, etc.)
 */
export const TRUTH_SEVERITY_ORDER: Record<TruthSeverity, number> = {
  broken: 0,
  warning: 1,
  pending: 2,
  neutral: 3,
  valid: 4,
}
