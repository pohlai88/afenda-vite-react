import { describe, expect, it } from "vitest"

import { ShellCommandConflictError } from "../errors/shell-command-conflict-error"
import { ShellCommandInvariantError } from "../errors/shell-command-invariant-error"
import { ShellCommandNotFoundError } from "../errors/shell-command-not-found-error"
import { ShellCommandSystemError } from "../errors/shell-command-system-error"
import { ShellCommandUnauthorizedError } from "../errors/shell-command-unauthorized-error"
import { ShellCommandValidationError } from "../errors/shell-command-validation-error"

describe("shell command error classes", () => {
  it("defines unauthorized error semantics", () => {
    const error = new ShellCommandUnauthorizedError()

    expect(error.code).toBe("SHELL_COMMAND_UNAUTHORIZED")
    expect(error.category).toBe("unauthorized")
    expect(error.severity).toBe("warning")
    expect(error.retryable).toBe(false)
  })

  it("defines validation error semantics", () => {
    const error = new ShellCommandValidationError()

    expect(error.code).toBe("SHELL_COMMAND_VALIDATION")
    expect(error.category).toBe("validation_failed")
    expect(error.severity).toBe("warning")
    expect(error.retryable).toBe(false)
  })

  it("defines invariant error semantics", () => {
    const error = new ShellCommandInvariantError()

    expect(error.code).toBe("SHELL_COMMAND_INVARIANT")
    expect(error.category).toBe("invariant_failed")
    expect(error.severity).toBe("error")
    expect(error.retryable).toBe(false)
  })

  it("defines conflict error semantics", () => {
    const error = new ShellCommandConflictError()

    expect(error.code).toBe("SHELL_COMMAND_CONFLICT")
    expect(error.category).toBe("conflict")
    expect(error.severity).toBe("warning")
    expect(error.retryable).toBe(true)
  })

  it("defines not found error semantics", () => {
    const error = new ShellCommandNotFoundError()

    expect(error.code).toBe("SHELL_COMMAND_NOT_FOUND")
    expect(error.category).toBe("not_found")
    expect(error.severity).toBe("warning")
    expect(error.retryable).toBe(false)
  })

  it("defines system error semantics", () => {
    const error = new ShellCommandSystemError()

    expect(error.code).toBe("SHELL_COMMAND_SYSTEM_ERROR")
    expect(error.category).toBe("system_error")
    expect(error.severity).toBe("error")
    expect(error.retryable).toBe(true)
  })
})
