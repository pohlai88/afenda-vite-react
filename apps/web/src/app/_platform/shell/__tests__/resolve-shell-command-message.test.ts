import { describe, expect, it } from "vitest"

import { resolveShellCommandMessage } from "../services/resolve-shell-command-message"

describe("resolveShellCommandMessage", () => {
  it("returns command-specific completed message when available", () => {
    expect(
      resolveShellCommandMessage({
        commandId: "dashboard.refresh",
        category: "completed",
      })
    ).toEqual({
      messageKey: "command.dashboard.refresh.completed",
      fallbackMessage: "Dashboard refreshed successfully.",
    })
  })

  it("returns command-specific validation failure message when available", () => {
    expect(
      resolveShellCommandMessage({
        commandId: "orders.create",
        category: "validation_failed",
      })
    ).toEqual({
      messageKey: "command.orders.create.validationFailed",
      fallbackMessage:
        "Order creation could not be completed because the input is invalid.",
    })
  })

  it("falls back to category-level messages when no command-specific entry exists", () => {
    expect(
      resolveShellCommandMessage({
        commandId: "unknown.command",
        category: "unauthorized",
      })
    ).toEqual({
      messageKey: "command.generic.unauthorized",
      fallbackMessage: "You are not allowed to perform this action.",
    })
  })

  it("falls back to generic completed message for unknown command success", () => {
    expect(
      resolveShellCommandMessage({
        commandId: "unknown.command",
        category: "completed",
      })
    ).toEqual({
      messageKey: "command.generic.completed",
      fallbackMessage: "Action completed successfully.",
    })
  })
})
