/**
 * SHELL COMMAND INTERACTION CONTRACT
 *
 * Canonical contracts for governing command interaction behavior at the UI edge.
 * This layer standardizes loading, disablement, duplicate execution, and
 * execution concurrency expectations.
 */

export type ShellCommandInteractionIntent =
  | "header-action"
  | "page-action"
  | "modal-submit"
  | "background-refresh"

export type ShellCommandConcurrencyPolicy = "block" | "allow" | "replace"

export type ShellCommandPresentationPolicy =
  | "blocking"
  | "non-blocking"
  | "optimistic"

export interface ShellCommandInteractionContext {
  commandId: string
  intent: ShellCommandInteractionIntent
}

export interface ShellCommandInteractionPolicy {
  concurrency: ShellCommandConcurrencyPolicy
  presentation: ShellCommandPresentationPolicy
  disableTriggerWhileRunning: boolean
  showLoadingIndicator: boolean
}

export interface ShellCommandInteractionState {
  commandId: string
  isRunning: boolean
}
