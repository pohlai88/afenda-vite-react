/**
 * SHELL COMMAND TOAST ADAPTER
 *
 * Emits translated shell command outcomes through a toast port.
 * Keeps toast policy and translation behavior outside components.
 */

import type { ShellCommandOutcome } from "../contract/shell-command-outcome-contract"
import { translateShellCommandOutcome } from "./translate-shell-command-outcome"

export interface ShellCommandToastPort {
  success(message: string): void
  error(message: string): void
  warning(message: string): void
  info(message: string): void
}

export interface EmitShellCommandToastOptions {
  port: ShellCommandToastPort
  outcome: ShellCommandOutcome
  translate: (key: string, fallback: string) => string
}

export function emitShellCommandToast(
  options: EmitShellCommandToastOptions
): void {
  const message = translateShellCommandOutcome({
    outcome: options.outcome,
    translate: options.translate,
  })

  if (options.outcome.severity === "success") {
    options.port.success(message)
    return
  }

  if (options.outcome.severity === "warning") {
    options.port.warning(message)
    return
  }

  if (options.outcome.severity === "error") {
    options.port.error(message)
    return
  }

  options.port.info(message)
}
