import { ShellCommandError } from "./shell-command-error"

/**
 * Thrown when command input or runtime validation fails before execution completes.
 */
export class ShellCommandValidationError extends ShellCommandError {
  readonly code = "SHELL_COMMAND_VALIDATION" as const
  readonly category = "validation_failed" as const
  readonly severity = "warning" as const

  constructor(
    message = "The action could not be completed because the input is invalid."
  ) {
    super({
      message,
      retryable: false,
    })
  }
}
