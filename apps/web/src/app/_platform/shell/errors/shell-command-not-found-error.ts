import { ShellCommandError } from "./shell-command-error"

/**
 * Thrown when the requested target resource does not exist, or a command is not registered.
 */
export class ShellCommandNotFoundError extends ShellCommandError {
  readonly code = "SHELL_COMMAND_NOT_FOUND" as const
  readonly category = "not_found" as const
  readonly severity = "warning" as const

  constructor(message = "The requested resource could not be found.") {
    super({
      message,
      retryable: false,
    })
  }
}
