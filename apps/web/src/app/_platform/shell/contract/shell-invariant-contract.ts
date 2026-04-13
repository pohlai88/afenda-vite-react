import type {
  ShellInvariantCode,
  ShellInvariantSeverity,
} from "./shell-invariant-codes"

export type { ShellInvariantSeverity } from "./shell-invariant-codes"

/**
 * SHELL INVARIANT ISSUE
 *
 * System-level shell truth failure.
 * This is intentionally separate from field-level validation issues.
 */
export interface ShellInvariantIssue {
  readonly code: ShellInvariantCode
  readonly severity: ShellInvariantSeverity
  readonly message: string
  readonly path?: string
  readonly routeId?: string
  readonly breadcrumbId?: string
  readonly details?: Record<string, unknown>
}
