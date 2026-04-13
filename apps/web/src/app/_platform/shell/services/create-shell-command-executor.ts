/**
 * SHELL COMMAND EXECUTOR
 *
 * Governs shell command lifecycle:
 * - resolve command definition
 * - authorize execution
 * - execute handler
 * - emit audit-ready lifecycle callbacks
 */

import type {
  ShellCommandExecutionContext,
  ShellCommandExecutionResult,
} from "../contract/shell-command-execution-contract"
import type { ShellCommandOutcome } from "../contract/shell-command-outcome-contract"
import type { ShellCommandRegistry } from "../registry/shell-command-registry"
import { ShellCommandNotFoundError } from "../errors/shell-command-not-found-error"
import { ShellCommandSystemError } from "../errors/shell-command-system-error"
import { classifyShellCommandOutcome } from "./classify-shell-command-outcome"

export interface ShellCommandAuditAdapter {
  onCommandStarted?(context: ShellCommandExecutionContext): void | Promise<void>
  onCommandSucceeded?(
    context: ShellCommandExecutionContext,
    outcome: ShellCommandOutcome
  ): void | Promise<void>
  onCommandFailed?(
    context: ShellCommandExecutionContext,
    outcome: ShellCommandOutcome,
    error: Error
  ): void | Promise<void>
}

export interface ShellCommandExecutor {
  execute(
    context: ShellCommandExecutionContext
  ): Promise<ShellCommandExecutionResult>
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value
  }

  const message =
    typeof value === "string" && value.trim().length > 0
      ? value
      : "Unknown command error"

  return new ShellCommandSystemError(message, value)
}

export function createShellCommandExecutor(
  registry: ShellCommandRegistry,
  auditAdapter?: ShellCommandAuditAdapter
): ShellCommandExecutor {
  return {
    async execute(context) {
      const definition = registry.getDefinition(context.commandId)

      if (!definition) {
        const error = new ShellCommandNotFoundError(
          `No handler found for command "${context.commandId}".`
        )
        const outcome = classifyShellCommandOutcome({
          commandId: context.commandId,
          error,
        })

        await auditAdapter?.onCommandFailed?.(context, outcome, error)

        return {
          ok: false,
          commandId: context.commandId,
          outcome,
          error,
        }
      }

      try {
        await auditAdapter?.onCommandStarted?.(context)

        if (definition.authorize) {
          await definition.authorize(context)
        }

        await definition.handler(context)

        const outcome = classifyShellCommandOutcome({
          commandId: context.commandId,
        })

        await auditAdapter?.onCommandSucceeded?.(context, outcome)

        return {
          ok: true,
          commandId: context.commandId,
          outcome,
        }
      } catch (cause) {
        const error = toError(cause)
        const outcome = classifyShellCommandOutcome({
          commandId: context.commandId,
          error,
        })

        await auditAdapter?.onCommandFailed?.(context, outcome, error)

        return {
          ok: false,
          commandId: context.commandId,
          outcome,
          error,
        }
      }
    },
  }
}
