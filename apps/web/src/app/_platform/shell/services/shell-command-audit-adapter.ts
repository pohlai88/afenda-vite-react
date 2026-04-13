/**
 * SHELL COMMAND AUDIT ADAPTER
 *
 * Seam where shell execution can emit audit evidence into the governed audit
 * subsystem. Default: console. Optional: interaction audit POST when
 * `VITE_SHELL_INTERACTION_AUDIT=true`.
 */

import type { ShellCommandAuditAdapter } from "./create-shell-command-executor"
import { buildShellCommandInteractionEnvelope } from "./build-shell-command-interaction-envelope"
import { emitShellInteractionAudit } from "./shell-interaction-audit-adapter"

export const consoleShellCommandAuditAdapter: ShellCommandAuditAdapter = {
  async onCommandStarted(context) {
    console.info("[shell-command:start]", context)
  },

  async onCommandSucceeded(context, outcome) {
    console.info("[shell-command:success]", context, outcome)
  },

  async onCommandFailed(context, outcome, error) {
    console.error("[shell-command:failure]", context, outcome, error)
  },
}

function createShellInteractionAuditingAdapter(): ShellCommandAuditAdapter {
  return {
    async onCommandStarted(context) {
      const envelope = buildShellCommandInteractionEnvelope("started", context)
      void emitShellInteractionAudit(envelope, {
        headers: { tenantId: context.tenantId },
      })
    },

    async onCommandSucceeded(context, outcome) {
      const envelope = buildShellCommandInteractionEnvelope(
        "succeeded",
        context,
        {
          outcome,
        }
      )
      void emitShellInteractionAudit(envelope, {
        headers: { tenantId: context.tenantId },
      })
    },

    async onCommandFailed(context, outcome, error) {
      const envelope = buildShellCommandInteractionEnvelope("failed", context, {
        outcome,
        error,
      })
      void emitShellInteractionAudit(envelope, {
        headers: { tenantId: context.tenantId },
      })
    },
  }
}

function combineAdapters(
  primary: ShellCommandAuditAdapter,
  secondary?: ShellCommandAuditAdapter
): ShellCommandAuditAdapter {
  return {
    async onCommandStarted(context) {
      await primary.onCommandStarted?.(context)
      await secondary?.onCommandStarted?.(context)
    },
    async onCommandSucceeded(context, outcome) {
      await primary.onCommandSucceeded?.(context, outcome)
      await secondary?.onCommandSucceeded?.(context, outcome)
    },
    async onCommandFailed(context, outcome, error) {
      await primary.onCommandFailed?.(context, outcome, error)
      await secondary?.onCommandFailed?.(context, outcome, error)
    },
  }
}

/**
 * Console + optional `VITE_SHELL_INTERACTION_AUDIT` interaction POST.
 */
export function createDefaultShellCommandAuditAdapter(): ShellCommandAuditAdapter {
  const interactionEnabled =
    import.meta.env.VITE_SHELL_INTERACTION_AUDIT === "true"
  return combineAdapters(
    consoleShellCommandAuditAdapter,
    interactionEnabled ? createShellInteractionAuditingAdapter() : undefined
  )
}
