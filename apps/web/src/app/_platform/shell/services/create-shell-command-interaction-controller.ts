/**
 * SHELL COMMAND INTERACTION CONTROLLER
 *
 * Imperative, **instance-scoped** controller (own running `Set` per `create…()` call).
 * Used in unit tests and non-React callers. **Application chrome** should prefer
 * `shellCommandActivityStore` + `useShellCommandRunner` / `useShellCommandActivity`
 * for global, observable activity. **Isolated UI subtrees** may use `useShellCommandInteraction`
 * (per-hook-instance state).
 */

import type {
  ShellCommandInteractionContext,
  ShellCommandInteractionPolicy,
  ShellCommandInteractionState,
} from "../contract/shell-command-interaction-contract"
import { resolveShellCommandInteractionPolicy } from "./resolve-shell-command-interaction-policy"

export interface ShellCommandInteractionController {
  canStart(context: ShellCommandInteractionContext): boolean
  start(context: ShellCommandInteractionContext): boolean
  finish(commandId: string): void
  getState(commandId: string): ShellCommandInteractionState
  getPolicy(
    context: ShellCommandInteractionContext
  ): ShellCommandInteractionPolicy
}

export function createShellCommandInteractionController(): ShellCommandInteractionController {
  const running = new Set<string>()

  return {
    canStart(context) {
      const policy = resolveShellCommandInteractionPolicy(context)

      if (policy.concurrency === "allow") {
        return true
      }

      if (policy.concurrency === "replace") {
        return true
      }

      return !running.has(context.commandId)
    },

    start(context) {
      const policy = resolveShellCommandInteractionPolicy(context)

      if (policy.concurrency === "block" && running.has(context.commandId)) {
        return false
      }

      running.add(context.commandId)
      return true
    },

    finish(commandId) {
      running.delete(commandId)
    },

    getState(commandId) {
      return {
        commandId,
        isRunning: running.has(commandId),
      }
    },

    getPolicy(context) {
      return resolveShellCommandInteractionPolicy(context)
    },
  }
}
