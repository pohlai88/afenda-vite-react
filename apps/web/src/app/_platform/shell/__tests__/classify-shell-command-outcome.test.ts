import { describe, expect, it } from "vitest"

import { ShellCommandConflictError } from "../errors/shell-command-conflict-error"
import { ShellCommandInvariantError } from "../errors/shell-command-invariant-error"
import { ShellCommandNotFoundError } from "../errors/shell-command-not-found-error"
import { ShellCommandUnauthorizedError } from "../errors/shell-command-unauthorized-error"
import { ShellCommandValidationError } from "../errors/shell-command-validation-error"
import { classifyShellCommandOutcome } from "../services/classify-shell-command-outcome"

describe("classifyShellCommandOutcome", () => {
  it("classifies success with message metadata", () => {
    expect(
      classifyShellCommandOutcome({
        commandId: "dashboard.refresh",
      })
    ).toEqual({
      commandId: "dashboard.refresh",
      status: "success",
      severity: "success",
      category: "completed",
      messageKey: "command.dashboard.refresh.completed",
      message: "Dashboard refreshed successfully.",
      retryable: false,
    })
  })

  it("classifies unauthorized errors with catalog-backed messaging", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "orders.create",
      error: new ShellCommandUnauthorizedError(
        "You cannot create orders in this tenant."
      ),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "warning",
      category: "unauthorized",
      messageKey: "command.orders.create.unauthorized",
      message: "You are not allowed to create orders.",
      retryable: false,
    })
    expect(outcome.error?.message).toBe(
      "You cannot create orders in this tenant."
    )
  })

  it("classifies validation errors with command-specific fallback messaging", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "orders.create",
      error: new ShellCommandValidationError(
        "Customer is required before creating an order."
      ),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "warning",
      category: "validation_failed",
      messageKey: "command.orders.create.validationFailed",
      message:
        "Order creation could not be completed because the input is invalid.",
      retryable: false,
    })
    expect(outcome.error?.message).toBe(
      "Customer is required before creating an order."
    )
  })

  it("classifies invariant errors with category fallback when command has no entry", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "orders.create",
      error: new ShellCommandInvariantError(
        "Tenant invariant violated during order creation."
      ),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "error",
      category: "invariant_failed",
      messageKey: "command.generic.invariantFailed",
      message: "The action violated a required system invariant.",
      retryable: false,
    })
  })

  it("classifies conflict errors with command-specific catalog fallback", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "orders.create",
      error: new ShellCommandConflictError(
        "The order number is already in use."
      ),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "warning",
      category: "conflict",
      messageKey: "command.orders.create.conflict",
      message:
        "Order creation could not be completed because of a conflicting state.",
      retryable: true,
    })
  })

  it("classifies not found errors with category fallback", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "orders.open",
      error: new ShellCommandNotFoundError("Order 99 was not found."),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "warning",
      category: "not_found",
      messageKey: "command.generic.notFound",
      message: "The requested resource could not be found.",
      retryable: false,
    })
  })

  it("uses category fallback for unknown commands", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "unknown.command",
      error: new ShellCommandUnauthorizedError(),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "warning",
      category: "unauthorized",
      messageKey: "command.generic.unauthorized",
      message: "You are not allowed to perform this action.",
      retryable: false,
    })
  })

  it("wraps unknown errors as system errors with catalog user messaging", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "dashboard.refresh",
      error: new Error("Unexpected upstream timeout."),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "error",
      category: "system_error",
      retryable: true,
      messageKey: "command.generic.systemError",
      message: "An unexpected system error occurred.",
    })
    expect(outcome.error?.message).toBe("Unexpected upstream timeout.")
  })

  it("uses default system catalog message when unknown error message is blank", () => {
    const outcome = classifyShellCommandOutcome({
      commandId: "dashboard.refresh",
      error: new Error("   "),
    })

    expect(outcome).toMatchObject({
      status: "failure",
      severity: "error",
      category: "system_error",
      messageKey: "command.generic.systemError",
      message: "An unexpected system error occurred.",
    })
  })
})
