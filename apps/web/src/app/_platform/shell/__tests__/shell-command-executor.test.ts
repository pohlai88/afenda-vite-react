import { describe, expect, it, vi } from "vitest"

import { ShellCommandNotFoundError } from "../errors/shell-command-not-found-error"
import { ShellCommandUnauthorizedError } from "../errors/shell-command-unauthorized-error"
import { createShellCommandRegistry } from "../registry/shell-command-registry"
import { createShellCommandExecutor } from "../services/create-shell-command-executor"

describe("ShellCommandExecutor", () => {
  it("executes an authorized command successfully", async () => {
    const handler = vi.fn()

    const registry = createShellCommandRegistry([
      {
        commandId: "dashboard.refresh",
        authorize: async () => {},
        handler,
      },
    ])

    const auditAdapter = {
      onCommandStarted: vi.fn(),
      onCommandSucceeded: vi.fn(),
      onCommandFailed: vi.fn(),
    }

    const executor = createShellCommandExecutor(registry, auditAdapter)

    const result = await executor.execute({
      commandId: "dashboard.refresh",
      source: "header-action",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.commandId).toBe("dashboard.refresh")
      expect(result.outcome).toMatchObject({
        status: "success",
        category: "completed",
        severity: "success",
        retryable: false,
      })
    }
    expect(handler).toHaveBeenCalledTimes(1)
    expect(auditAdapter.onCommandStarted).toHaveBeenCalledTimes(1)
    expect(auditAdapter.onCommandSucceeded).toHaveBeenCalledTimes(1)
    expect(auditAdapter.onCommandSucceeded).toHaveBeenCalledWith(
      expect.objectContaining({ commandId: "dashboard.refresh" }),
      expect.objectContaining({
        status: "success",
        category: "completed",
      })
    )
    expect(auditAdapter.onCommandFailed).not.toHaveBeenCalled()
  })

  it("returns failure when the command does not exist", async () => {
    const registry = createShellCommandRegistry([])
    const auditAdapter = {
      onCommandStarted: vi.fn(),
      onCommandSucceeded: vi.fn(),
      onCommandFailed: vi.fn(),
    }

    const executor = createShellCommandExecutor(registry, auditAdapter)

    const result = await executor.execute({
      commandId: "missing.command",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.outcome.category).toBe("not_found")
      expect(result.error.message).toMatch(/No handler found/)
    }
    expect(auditAdapter.onCommandFailed).toHaveBeenCalledTimes(1)
    expect(auditAdapter.onCommandFailed).toHaveBeenCalledWith(
      expect.objectContaining({ commandId: "missing.command" }),
      expect.objectContaining({ category: "not_found" }),
      expect.any(ShellCommandNotFoundError)
    )
  })

  it("returns failure when authorization is denied", async () => {
    const handler = vi.fn()

    const registry = createShellCommandRegistry([
      {
        commandId: "orders.create",
        authorize: async () => {
          throw new ShellCommandUnauthorizedError()
        },
        handler,
      },
    ])

    const executor = createShellCommandExecutor(registry)

    const result = await executor.execute({
      commandId: "orders.create",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.outcome.category).toBe("unauthorized")
    }
    expect(handler).not.toHaveBeenCalled()
  })

  it("returns failure when the handler throws", async () => {
    const registry = createShellCommandRegistry([
      {
        commandId: "orders.create",
        handler: () => {
          throw new Error("Boom")
        },
      },
    ])

    const executor = createShellCommandExecutor(registry)

    const result = await executor.execute({
      commandId: "orders.create",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe("Boom")
      expect(result.outcome.category).toBe("system_error")
    }
  })

  it("wraps non-Error handler throws as governed system errors", async () => {
    const registry = createShellCommandRegistry([
      {
        commandId: "orders.create",
        handler: () => {
          throw "string rejection"
        },
      },
    ])

    const executor = createShellCommandExecutor(registry)

    const result = await executor.execute({
      commandId: "orders.create",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe("string rejection")
      expect(result.outcome.category).toBe("system_error")
      expect(result.outcome.retryable).toBe(true)
    }
  })
})
