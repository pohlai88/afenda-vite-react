/**
 * BUILD SHELL COMMAND INTERACTION ENVELOPE
 *
 * Maps command execution context + lifecycle phase into a shell interaction
 * audit envelope (UI evidence only).
 */

import type { ShellCommandExecutionContext } from "../contract/shell-command-execution-contract"
import type { ShellCommandOutcome } from "../contract/shell-command-outcome-contract"
import type {
  ShellInteractionAuditEnvelope,
  ShellInteractionMechanism,
  ShellInteractionPhase,
} from "../contract/shell-interaction-audit-contract"

export function buildShellCommandInteractionEnvelope(
  phase: ShellInteractionPhase,
  context: ShellCommandExecutionContext,
  options?: {
    outcome?: ShellCommandOutcome
    error?: Error
    mechanism?: ShellInteractionMechanism
  }
): ShellInteractionAuditEnvelope {
  const mechanism = options?.mechanism ?? "programmatic"
  const envelope: ShellInteractionAuditEnvelope = {
    kind: "shell.command",
    mechanism,
    interactionPhase: phase,
    commandId: context.commandId,
    actorUserId: context.actorUserId,
    tenantId: context.tenantId,
    routeId: context.routeId,
    occurredAt: new Date().toISOString(),
  }

  if (context.source !== undefined) {
    envelope.shellSurface = context.source
  }

  if (options?.outcome !== undefined) {
    envelope.commandOutcomeCategory = options.outcome.category
  }

  if (options?.error !== undefined) {
    envelope.errorMessage = options.error.message.slice(0, 500)
  }

  return envelope
}
