/**
 * SHELL COMMAND RUNNER
 *
 * Orchestrates interaction policy, activity store, executor, and feedback.
 */

import { useMemo } from "react"

import type { ShellCommandInteractionContext } from "../contract/shell-command-interaction-contract"
import { resolveShellCommandInteractionPolicy } from "../services/resolve-shell-command-interaction-policy"
import { shellCommandActivityStore } from "../store/shell-command-activity-store-instance"

import { useShellCommandExecutor } from "./use-shell-command-executor"
import { useShellCommandFeedback } from "./use-shell-command-feedback"
import { useShellRouteResolution } from "./use-shell-route-meta"

import type { ShellCommandExecutionResult } from "../contract/shell-command-execution-contract"

export type ShellCommandRunnerContext = ShellCommandInteractionContext & {
  readonly payload?: unknown
  /** When set, overrides auto-resolved `routeId` from the current shell route trace. */
  readonly routeId?: string
  /** Wired when auth/tenant context exists; optional for audit-ready execution. */
  readonly tenantId?: string
  readonly actorUserId?: string
}

export type ShellCommandRunnerResult =
  | { readonly skipped: true }
  | { readonly skipped: false; readonly result: ShellCommandExecutionResult }

export interface ShellCommandRunner {
  (context: ShellCommandRunnerContext): Promise<ShellCommandRunnerResult>
}

export function useShellCommandRunner(): ShellCommandRunner {
  const executor = useShellCommandExecutor()
  const feedback = useShellCommandFeedback()
  const { trace } = useShellRouteResolution()

  return useMemo(
    () =>
      async function run(
        context: ShellCommandRunnerContext
      ): Promise<ShellCommandRunnerResult> {
        const policy = resolveShellCommandInteractionPolicy(context)

        if (
          policy.concurrency === "block" &&
          shellCommandActivityStore.isRunning(context.commandId)
        ) {
          return { skipped: true }
        }

        if (!shellCommandActivityStore.start(context.commandId)) {
          return { skipped: true }
        }

        try {
          const result = await executor.execute({
            commandId: context.commandId,
            source: context.intent,
            feedbackIntent: context.intent,
            payload: context.payload,
            routeId: context.routeId ?? trace.registeredRouteId,
            tenantId: context.tenantId,
            actorUserId: context.actorUserId,
          })

          feedback.emitOutcome(result.outcome, {
            intent: context.intent,
          })

          return { skipped: false, result }
        } finally {
          shellCommandActivityStore.finish(context.commandId)
        }
      },
    [executor, feedback, trace]
  )
}
