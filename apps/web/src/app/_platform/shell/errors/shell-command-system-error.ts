import { ShellCommandError } from "./shell-command-error"

/**
 * Wraps unexpected failures into a governed shell command error shape.
 */
export class ShellCommandSystemError extends ShellCommandError {
  readonly code = "SHELL_COMMAND_SYSTEM_ERROR" as const
  readonly category = "system_error" as const
  readonly severity = "error" as const

  constructor(
    message = "An unexpected system error occurred.",
    cause?: unknown
  ) {
    super({
      message,
      retryable: true,
      cause,
    })
  }
}
