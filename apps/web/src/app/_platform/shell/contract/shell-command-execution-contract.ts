/**
 * SHELL COMMAND EXECUTION CONTRACT
 *
 * Canonical execution contracts for shell command lifecycle handling.
 * This layer governs command resolution, authorization, execution outcome,
 * and audit-ready metadata emission.
 */

import type { ShellCommandFeedbackIntent } from "./shell-command-feedback-contract"
import type { ShellCommandOutcome } from "./shell-command-outcome-contract"

export interface ShellCommandExecutionContext {
  commandId: string
  source?: string
  /** Optional: align execution/audit with how feedback will be surfaced (see feedback policy). */
  feedbackIntent?: ShellCommandFeedbackIntent
  routeId?: string
  actorUserId?: string
  tenantId?: string
  payload?: unknown
}

export interface ShellCommandExecutionSuccess {
  ok: true
  commandId: string
  outcome: ShellCommandOutcome
}

export interface ShellCommandExecutionFailure {
  ok: false
  commandId: string
  outcome: ShellCommandOutcome
  error: Error
}

export type ShellCommandExecutionResult =
  | ShellCommandExecutionSuccess
  | ShellCommandExecutionFailure
