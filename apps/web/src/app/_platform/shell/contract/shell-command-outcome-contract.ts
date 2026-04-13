/**
 * SHELL COMMAND OUTCOME CONTRACT
 *
 * Canonical outcome classification for shell command execution.
 * This contract standardizes:
 * - user-facing severity
 * - retryability
 * - audit classification
 * - UX messaging intent
 */

export type ShellCommandOutcomeStatus = "success" | "failure"

export type ShellCommandOutcomeSeverity =
  | "info"
  | "success"
  | "warning"
  | "error"

export type ShellCommandOutcomeCategory =
  | "completed"
  | "cancelled"
  | "unauthorized"
  | "validation_failed"
  | "invariant_failed"
  | "not_found"
  | "conflict"
  | "system_error"

export interface ShellCommandOutcome {
  commandId: string
  status: ShellCommandOutcomeStatus
  severity: ShellCommandOutcomeSeverity
  category: ShellCommandOutcomeCategory
  /**
   * Stable key for `shell` namespace translation (see message catalog).
   */
  messageKey: string
  /**
   * Governed fallback copy for tests, audit summaries, and contexts without `t()`.
   * Prefer translating `messageKey` in UI; do not use raw `error.message` for UX.
   */
  message: string
  retryable: boolean
  /** Original failure for logs, diagnostics, and audit detail — not primary UX copy. */
  error?: Error
}
