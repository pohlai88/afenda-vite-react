/**
 * RESOLVE SHELL COMMAND FEEDBACK PLAN
 *
 * Determines how a governed shell command outcome should be presented based on
 * interaction intent and outcome semantics.
 */

import type {
  ShellCommandFeedbackContext,
  ShellCommandFeedbackPlan,
} from "../contract/shell-command-feedback-contract"

export interface ResolveShellCommandFeedbackPlanOptions {
  context: ShellCommandFeedbackContext
  outcome: ShellCommandFeedbackPlan["outcome"]
}

export function resolveShellCommandFeedbackPlan(
  options: ResolveShellCommandFeedbackPlanOptions
): ShellCommandFeedbackPlan {
  const { context, outcome } = options

  if (context.intent === "background-refresh") {
    if (outcome.status === "success") {
      return {
        surface: "silent",
        outcome,
      }
    }

    return {
      surface: "banner",
      outcome,
    }
  }

  if (context.intent === "modal-submit") {
    if (
      outcome.category === "validation_failed" ||
      outcome.category === "conflict"
    ) {
      return {
        surface: "inline",
        outcome,
      }
    }

    if (outcome.status === "success") {
      return {
        surface: "toast",
        outcome,
      }
    }

    return {
      surface: "banner",
      outcome,
    }
  }

  if (context.intent === "page-action") {
    if (outcome.status === "success") {
      return {
        surface: "toast",
        outcome,
      }
    }

    if (
      outcome.category === "validation_failed" ||
      outcome.category === "conflict"
    ) {
      return {
        surface: "inline",
        outcome,
      }
    }

    return {
      surface: "banner",
      outcome,
    }
  }

  return {
    surface: "toast",
    outcome,
  }
}
