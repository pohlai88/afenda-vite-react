import { describe, expect, it } from "vitest"

import { translateShellCommandOutcome } from "../services/translate-shell-command-outcome"

describe("translateShellCommandOutcome", () => {
  it("uses the outcome messageKey and fallback message", () => {
    const result = translateShellCommandOutcome({
      outcome: {
        commandId: "orders.create",
        status: "failure",
        severity: "warning",
        category: "validation_failed",
        messageKey: "command.orders.create.validationFailed",
        message:
          "Order creation could not be completed because the input is invalid.",
        retryable: false,
      },
      translate: (key, fallback) => `translated:${key}:${fallback}`,
    })

    expect(result).toBe(
      "translated:command.orders.create.validationFailed:Order creation could not be completed because the input is invalid."
    )
  })
})
