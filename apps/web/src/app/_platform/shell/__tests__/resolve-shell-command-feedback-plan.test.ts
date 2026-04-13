import { describe, expect, it } from "vitest"

import { resolveShellCommandFeedbackPlan } from "../services/resolve-shell-command-feedback-plan"

const successOutcome = {
  commandId: "dashboard.refresh",
  status: "success" as const,
  severity: "success" as const,
  category: "completed" as const,
  messageKey: "command.dashboard.refresh.completed",
  message: "Dashboard refreshed successfully.",
  retryable: false,
}

const validationFailureOutcome = {
  commandId: "orders.create",
  status: "failure" as const,
  severity: "warning" as const,
  category: "validation_failed" as const,
  messageKey: "command.orders.create.validationFailed",
  message:
    "Order creation could not be completed because the input is invalid.",
  retryable: false,
}

const systemFailureOutcome = {
  commandId: "dashboard.refresh",
  status: "failure" as const,
  severity: "error" as const,
  category: "system_error" as const,
  messageKey: "command.generic.systemError",
  message: "An unexpected system error occurred.",
  retryable: true,
}

describe("resolveShellCommandFeedbackPlan", () => {
  it("uses toast for header action success", () => {
    expect(
      resolveShellCommandFeedbackPlan({
        context: { intent: "header-action" },
        outcome: successOutcome,
      })
    ).toEqual({
      surface: "toast",
      outcome: successOutcome,
    })
  })

  it("uses inline for modal validation failure", () => {
    expect(
      resolveShellCommandFeedbackPlan({
        context: { intent: "modal-submit" },
        outcome: validationFailureOutcome,
      })
    ).toEqual({
      surface: "inline",
      outcome: validationFailureOutcome,
    })
  })

  it("uses banner for modal system failure", () => {
    expect(
      resolveShellCommandFeedbackPlan({
        context: { intent: "modal-submit" },
        outcome: systemFailureOutcome,
      })
    ).toEqual({
      surface: "banner",
      outcome: systemFailureOutcome,
    })
  })

  it("uses silent for background refresh success", () => {
    expect(
      resolveShellCommandFeedbackPlan({
        context: { intent: "background-refresh" },
        outcome: successOutcome,
      })
    ).toEqual({
      surface: "silent",
      outcome: successOutcome,
    })
  })

  it("uses banner for background refresh failure", () => {
    expect(
      resolveShellCommandFeedbackPlan({
        context: { intent: "background-refresh" },
        outcome: systemFailureOutcome,
      })
    ).toEqual({
      surface: "banner",
      outcome: systemFailureOutcome,
    })
  })
})
