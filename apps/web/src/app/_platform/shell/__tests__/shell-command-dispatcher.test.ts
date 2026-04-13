import { describe, expect, it, vi } from "vitest"

import { createShellCommandDispatcher } from "../services/create-shell-command-dispatcher"
import { createShellCommandRegistry } from "../registry/shell-command-registry"

describe("ShellCommandDispatcher", () => {
  it("dispatches command to handler", async () => {
    const handler = vi.fn()

    const registry = createShellCommandRegistry([
      {
        commandId: "test.command",
        handler,
      },
    ])

    const dispatcher = createShellCommandDispatcher(registry)

    await dispatcher.dispatch("test.command", { payload: 123 })

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        commandId: "test.command",
        payload: 123,
      })
    )
  })

  it("throws when command is not found", async () => {
    const registry = createShellCommandRegistry([])

    const dispatcher = createShellCommandDispatcher(registry)

    await expect(() => dispatcher.dispatch("missing.command")).rejects.toThrow(
      /No handler found/
    )
  })

  it("awaits async handlers", async () => {
    const handler = vi.fn(async () => {
      await Promise.resolve()
    })

    const registry = createShellCommandRegistry([
      { commandId: "async.cmd", handler },
    ])
    const dispatcher = createShellCommandDispatcher(registry)

    await dispatcher.dispatch("async.cmd", { source: "test" })

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        commandId: "async.cmd",
        source: "test",
      })
    )
  })
})
