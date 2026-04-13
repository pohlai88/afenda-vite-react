/**
 * SHELL COMMAND DISPATCHER
 *
 * Thin façade over the shell command executor: same lifecycle and registry,
 * but throws on failure (legacy imperative callers).
 */

import type { ShellCommandExecutionContext } from "../contract/shell-command-execution-contract"
import type { ShellCommandId } from "../contract/shell-command-contract"
import type { ShellCommandRegistry } from "../registry/shell-command-registry"
import type { ShellCommandAuditAdapter } from "./create-shell-command-executor"
import { createShellCommandExecutor } from "./create-shell-command-executor"

export type ShellCommandDispatchFields = Omit<
  ShellCommandExecutionContext,
  "commandId"
>

export interface ShellCommandDispatcher {
  dispatch(
    commandId: ShellCommandId,
    context?: ShellCommandDispatchFields
  ): Promise<void>
}

export function createShellCommandDispatcher(
  registry: ShellCommandRegistry,
  auditAdapter?: ShellCommandAuditAdapter
): ShellCommandDispatcher {
  const executor = createShellCommandExecutor(registry, auditAdapter)

  return {
    async dispatch(commandId, context = {}) {
      const result = await executor.execute({
        commandId,
        ...context,
      })

      if (!result.ok) {
        throw result.error
      }
    },
  }
}
