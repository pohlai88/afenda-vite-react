/**
 * SHELL COMMAND EXECUTOR HOOK
 *
 * Runtime hook exposing the governed shell command executor.
 */

import { useMemo } from "react"

import { shellCommandRegistry } from "../registry/shell-command-registry-instance"
import { createDefaultShellCommandAuditAdapter } from "../services/shell-command-audit-adapter"
import { createShellCommandExecutor } from "../services/create-shell-command-executor"

export function useShellCommandExecutor() {
  return useMemo(
    () =>
      createShellCommandExecutor(
        shellCommandRegistry,
        createDefaultShellCommandAuditAdapter()
      ),
    []
  )
}
