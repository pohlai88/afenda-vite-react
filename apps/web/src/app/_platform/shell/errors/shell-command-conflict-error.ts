import { ShellCommandError } from "./shell-command-error"

/**
 * Thrown when the requested action conflicts with the current resource state.
 */
export class ShellCommandConflictError extends ShellCommandError {
  readonly code = "SHELL_COMMAND_CONFLICT" as const
  readonly category = "conflict" as const
  readonly severity = "warning" as const

  constructor(
    message = "The action could not be completed because of a conflicting state."
  ) {
    super({
      message,
      retryable: true,
    })
  }
}
