/**
 * SHELL COMMAND MESSAGE CONTRACT
 *
 * Canonical message resolution contracts for shell command outcomes.
 * This layer standardizes translation keys and fallback message text for
 * governed shell command UX and audit summaries.
 */

import type { ShellCommandOutcomeCategory } from "./shell-command-outcome-contract"

export interface ShellCommandMessageDescriptor {
  /**
   * Translation key in the `shell` namespace.
   */
  messageKey: string

  /**
   * Stable fallback message for environments where translation is unavailable.
   */
  fallbackMessage: string
}

export interface ResolveShellCommandMessageOptions {
  commandId: string
  category: ShellCommandOutcomeCategory
}
