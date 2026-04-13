/**
 * TRANSLATE SHELL COMMAND OUTCOME
 *
 * Resolves a governed shell command outcome into final user-facing text through
 * the active translation runtime, with deterministic fallback behavior.
 */

import type { ShellCommandOutcome } from "../contract/shell-command-outcome-contract"

export interface TranslateShellCommandOutcomeOptions {
  outcome: ShellCommandOutcome
  translate: (key: string, fallback: string) => string
}

export function translateShellCommandOutcome(
  options: TranslateShellCommandOutcomeOptions
): string {
  return options.translate(options.outcome.messageKey, options.outcome.message)
}
