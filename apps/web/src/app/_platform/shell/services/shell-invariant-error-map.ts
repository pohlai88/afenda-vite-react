import type { ShellInvariantIssue } from "../contract/shell-invariant-contract"
import { ShellInvariantError } from "./shell-invariant-error"

export function createShellInvariantError(
  issues: readonly ShellInvariantIssue[]
): ShellInvariantError {
  const count = issues.length
  return new ShellInvariantError(
    `Shell route catalog invariant violation (${count} issue${count === 1 ? "" : "s"})`,
    issues
  )
}
