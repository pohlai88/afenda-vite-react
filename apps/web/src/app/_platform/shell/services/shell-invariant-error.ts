import type { ShellInvariantIssue } from "../contract/shell-invariant-contract"

/** Thrown when governed shell route catalog invariants fail. */
export class ShellInvariantError extends Error {
  readonly code = "SHELL_INVARIANT_VIOLATION" as const

  constructor(
    message: string,
    readonly issues: readonly ShellInvariantIssue[]
  ) {
    super(message)
    this.name = "ShellInvariantError"
  }
}
