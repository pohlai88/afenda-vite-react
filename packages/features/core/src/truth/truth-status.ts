import type { TruthResolution } from './truth-resolution'

/**
 * Severity levels for truth states.
 * Maps directly to CSS tokens: --truth-valid, --truth-warning, etc.
 */
export type TruthSeverity =
  | 'valid'
  | 'warning'
  | 'broken'
  | 'pending'
  | 'neutral'

/**
 * Scope impact determines which level of the breadcrumb/scope hierarchy is affected.
 * Used for accurate severity dot placement in scope-switchers.
 */
export type ScopeImpact = 'global' | 'entity' | 'transaction'

/**
 * TruthStatus represents the state of a single invariant or business rule.
 * This is the canonical representation used throughout the system.
 */
export interface TruthStatus {
  /** Severity level (maps to CSS tokens) */
  readonly severity: TruthSeverity
  /**
   * Priority for sorting within the same severity.
   * Higher number = higher priority.
   * Example: FX missing (warning, priority 100) vs minor mismatch (warning, priority 10)
   */
  readonly priority?: number
  /** Which scope level is affected by this status */
  readonly scopeImpact: ScopeImpact
  /** Unique invariant identifier for lookup and i18n */
  readonly invariantKey: string
  /** Human-readable message describing the status */
  readonly message: string
  /** Reference to doctrine/policy that defines this invariant */
  readonly doctrineRef?: string
  /** How to resolve this issue, if applicable */
  readonly resolution?: TruthResolution
  /** Entity references affected by this status */
  readonly entityRefs?: readonly string[]
}

/**
 * TruthHealthSummary aggregates truth state for a given scope.
 * Used by the health store and displayed in user menu Section 0.
 */
export interface TruthHealthSummary {
  /** Overall integrity score (0-100) */
  readonly integrityScore: number
  /** All invariant failures (severity: broken) */
  readonly invariantFailures: readonly TruthStatus[]
  /** All warnings (severity: warning) */
  readonly warnings: readonly TruthStatus[]
  /** ISO timestamp of last reconciliation */
  readonly lastReconciliation?: string
}
