import { describe, expect, it } from "vitest"

import { createShellCommandInteractionController } from "../services/create-shell-command-interaction-controller"

describe("ShellCommandInteractionController", () => {
  it("blocks duplicate starts for block concurrency", () => {
    const controller = createShellCommandInteractionController()

    const context = {
      commandId: "orders.create",
      intent: "modal-submit" as const,
    }

    expect(controller.start(context)).toBe(true)
    expect(controller.start(context)).toBe(false)
    expect(controller.getState("orders.create")).toEqual({
      commandId: "orders.create",
      isRunning: true,
    })
  })

  it("releases running state after finish", () => {
    const controller = createShellCommandInteractionController()

    const context = {
      commandId: "orders.create",
      intent: "modal-submit" as const,
    }

    controller.start(context)
    controller.finish("orders.create")

    expect(controller.getState("orders.create")).toEqual({
      commandId: "orders.create",
      isRunning: false,
    })
  })

  it("allows repeated starts for replace concurrency", () => {
    const controller = createShellCommandInteractionController()

    const context = {
      commandId: "dashboard.refresh",
      intent: "background-refresh" as const,
    }

    expect(controller.start(context)).toBe(true)
    expect(controller.start(context)).toBe(true)
  })
})
