/**
 * CLASSIFY SHELL COMMAND OUTCOME
 *
 * Converts execution success/failure into governed outcome semantics and
 * resolves stable user-facing message metadata from the message catalog.
 * Classification is type-based for `ShellCommandError` subclasses; unexpected
 * failures are wrapped for category/retryability while UX copy stays catalog-backed.
 */

import type { ShellCommandOutcome } from "../contract/shell-command-outcome-contract"
import { ShellCommandError } from "../errors/shell-command-error"
import { ShellCommandSystemError } from "../errors/shell-command-system-error"
import { resolveShellCommandMessage } from "./resolve-shell-command-message"

export interface ClassifyShellCommandOutcomeOptions {
  commandId: string
  error?: Error
}

function toGovernedError(error: Error): ShellCommandError {
  if (error instanceof ShellCommandError) {
    return error
  }

  const message = error.message.trim()

  return new ShellCommandSystemError(
    message.length > 0 ? message : "An unexpected system error occurred.",
    error
  )
}

export function classifyShellCommandOutcome(
  options: ClassifyShellCommandOutcomeOptions
): ShellCommandOutcome {
  const { commandId, error } = options

  if (!error) {
    const messageDescriptor = resolveShellCommandMessage({
      commandId,
      category: "completed",
    })

    return {
      commandId,
      status: "success",
      severity: "success",
      category: "completed",
      messageKey: messageDescriptor.messageKey,
      message: messageDescriptor.fallbackMessage,
      retryable: false,
    }
  }

  const governedError = toGovernedError(error)
  const messageDescriptor = resolveShellCommandMessage({
    commandId,
    category: governedError.category,
  })

  return {
    commandId,
    status: "failure",
    severity: governedError.severity,
    category: governedError.category,
    messageKey: messageDescriptor.messageKey,
    message: messageDescriptor.fallbackMessage,
    retryable: governedError.retryable,
    error,
  }
}
