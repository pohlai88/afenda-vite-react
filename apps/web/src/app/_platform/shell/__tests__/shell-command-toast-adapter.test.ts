import { describe, expect, it, vi } from "vitest"

import { emitShellCommandToast } from "../services/shell-command-toast-adapter"

describe("emitShellCommandToast", () => {
  it("emits success toasts for success outcomes", () => {
    const port = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    }

    emitShellCommandToast({
      port,
      outcome: {
        commandId: "dashboard.refresh",
        status: "success",
        severity: "success",
        category: "completed",
        messageKey: "command.dashboard.refresh.completed",
        message: "Dashboard refreshed successfully.",
        retryable: false,
      },
      translate: (key, fallback) => `${key}:${fallback}`,
    })

    expect(port.success).toHaveBeenCalledWith(
      "command.dashboard.refresh.completed:Dashboard refreshed successfully."
    )
    expect(port.error).not.toHaveBeenCalled()
    expect(port.warning).not.toHaveBeenCalled()
    expect(port.info).not.toHaveBeenCalled()
  })

  it("emits warning toasts for warning outcomes", () => {
    const port = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    }

    emitShellCommandToast({
      port,
      outcome: {
        commandId: "orders.create",
        status: "failure",
        severity: "warning",
        category: "unauthorized",
        messageKey: "command.orders.create.unauthorized",
        message: "You are not allowed to create orders.",
        retryable: false,
      },
      translate: (_key, fallback) => fallback,
    })

    expect(port.warning).toHaveBeenCalledWith(
      "You are not allowed to create orders."
    )
  })

  it("emits error toasts for error outcomes", () => {
    const port = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    }

    emitShellCommandToast({
      port,
      outcome: {
        commandId: "orders.create",
        status: "failure",
        severity: "error",
        category: "system_error",
        messageKey: "command.generic.systemError",
        message: "An unexpected system error occurred.",
        retryable: true,
      },
      translate: (_key, fallback) => fallback,
    })

    expect(port.error).toHaveBeenCalledWith(
      "An unexpected system error occurred."
    )
  })

  it("emits info toasts for info severity outcomes", () => {
    const port = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    }

    emitShellCommandToast({
      port,
      outcome: {
        commandId: "x",
        status: "success",
        severity: "info",
        category: "completed",
        messageKey: "command.generic.completed",
        message: "Done",
        retryable: false,
      },
      translate: (_key, fallback) => fallback,
    })

    expect(port.info).toHaveBeenCalledWith("Done")
    expect(port.success).not.toHaveBeenCalled()
  })
})
