import { ShellCommandError } from "./shell-command-error"

/**
 * Thrown when the current actor is not allowed to execute a shell command.
 */
export class ShellCommandUnauthorizedError extends ShellCommandError {
  readonly code = "SHELL_COMMAND_UNAUTHORIZED" as const
  readonly category = "unauthorized" as const
  readonly severity = "warning" as const

  constructor(message = "You are not allowed to perform this action.") {
    super({
      message,
      retryable: false,
    })
  }
}
