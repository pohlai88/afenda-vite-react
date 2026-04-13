import { ShellCommandError } from "./shell-command-error"

/**
 * Thrown when a governed runtime invariant is violated.
 */
export class ShellCommandInvariantError extends ShellCommandError {
  readonly code = "SHELL_COMMAND_INVARIANT" as const
  readonly category = "invariant_failed" as const
  readonly severity = "error" as const

  constructor(message = "The action violated a required system invariant.") {
    super({
      message,
      retryable: false,
    })
  }
}
