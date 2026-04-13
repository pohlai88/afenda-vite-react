/**
 * RESOLVE SHELL COMMAND INTERACTION POLICY
 *
 * Determines command interaction behavior from the governed interaction intent.
 */

import type {
  ShellCommandInteractionContext,
  ShellCommandInteractionPolicy,
} from "../contract/shell-command-interaction-contract"

export function resolveShellCommandInteractionPolicy(
  context: ShellCommandInteractionContext
): ShellCommandInteractionPolicy {
  if (context.intent === "background-refresh") {
    return {
      concurrency: "replace",
      presentation: "non-blocking",
      disableTriggerWhileRunning: false,
      showLoadingIndicator: false,
    }
  }

  if (context.intent === "modal-submit") {
    return {
      concurrency: "block",
      presentation: "blocking",
      disableTriggerWhileRunning: true,
      showLoadingIndicator: true,
    }
  }

  if (context.intent === "page-action") {
    return {
      concurrency: "block",
      presentation: "blocking",
      disableTriggerWhileRunning: true,
      showLoadingIndicator: true,
    }
  }

  return {
    concurrency: "block",
    presentation: "non-blocking",
    disableTriggerWhileRunning: true,
    showLoadingIndicator: true,
  }
}
