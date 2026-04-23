import type { CommandExecutionRequest } from "./command-contracts.js"
import type {
  CommandExecutionContext,
  CommandExecutionResult,
} from "./execute-command.js"
import {
  executeOpsEventAdvanceCommand,
  executeOpsEventClaimCommand,
} from "../modules/operations/ops.commands.js"
import { permissionForCommand } from "./command-matrix.js"

type RegisteredCommand = {
  readonly permission: string
  readonly execute: (
    context: CommandExecutionContext,
    payload: CommandExecutionRequest["payload"]
  ) => Promise<CommandExecutionResult>
}

export const commandRegistry: Readonly<Record<string, RegisteredCommand>> = {
  "ops.event.claim": {
    permission: permissionForCommand("ops.event.claim"),
    execute: (context, payload) =>
      executeOpsEventClaimCommand(context, payload as { eventId: string }),
  },
  "ops.event.advance": {
    permission: permissionForCommand("ops.event.advance"),
    execute: (context, payload) =>
      executeOpsEventAdvanceCommand(context, payload as { eventId: string }),
  },
} as const
