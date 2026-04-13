/**
 * SHELL COMMAND CONTRACT
 *
 * Canonical command contract for shell-triggered actions.
 * Commands represent declarative action identities that map to executable logic.
 *
 * Rules:
 * - commandId must be stable and unique
 * - execution is handled by registered handlers, not metadata
 * - handlers receive a governed execution context (not ad hoc payloads)
 */

import type { ShellCommandExecutionContext } from "./shell-command-execution-contract"

export type ShellCommandId = string

/**
 * Authorization succeeds by returning normally; denial throws a typed error
 * (typically `ShellCommandUnauthorizedError`).
 */
export type ShellCommandAuthorize = (
  context: ShellCommandExecutionContext
) => void | Promise<void>

export type ShellCommandHandler = (
  context: ShellCommandExecutionContext
) => void | Promise<void>

export interface ShellCommandDefinition {
  commandId: ShellCommandId
  authorize?: ShellCommandAuthorize
  handler: ShellCommandHandler
}
