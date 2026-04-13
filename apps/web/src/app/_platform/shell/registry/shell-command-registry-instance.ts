import type { ShellCommandDefinition } from "../contract/shell-command-contract"
import { createShellCommandRegistry } from "./shell-command-registry"

/**
 * SHELL COMMAND DEFINITIONS
 *
 * Compose gradually from features and route-owned command ids — avoid a single
 * forever-centralized list as the app grows.
 *
 * Every `commandId` referenced from shell metadata (e.g. header actions) must
 * have a definition here or execution will return a structured failure.
 */
const definitions = [
  {
    commandId: "refresh-events-view",
    handler: (_context) => {
      /* Events list refresh — wire to feature data layer when present */
    },
  },
] as const satisfies readonly ShellCommandDefinition[]

export const shellCommandRegistry = createShellCommandRegistry(definitions)
