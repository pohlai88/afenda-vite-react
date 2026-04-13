/**
 * SHELL COMMAND ERROR
 *
 * Base error class for governed shell command failures.
 * Subclasses define deterministic outcome semantics for classification,
 * retryability, and audit mapping.
 */

import type {
  ShellCommandOutcomeCategory,
  ShellCommandOutcomeSeverity,
} from "../contract/shell-command-outcome-contract"

export interface ShellCommandErrorOptions {
  message: string
  retryable?: boolean
  cause?: unknown
}

export abstract class ShellCommandError extends Error {
  abstract readonly code: string
  abstract readonly category: ShellCommandOutcomeCategory
  abstract readonly severity: ShellCommandOutcomeSeverity
  readonly retryable: boolean
  readonly cause?: unknown

  protected constructor(options: ShellCommandErrorOptions) {
    super(options.message)
    this.name = new.target.name
    this.retryable = options.retryable ?? false
    this.cause = options.cause
  }
}
