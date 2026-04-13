/**
 * SHELL COMMAND REGISTRY
 *
 * Static registry for shell command definitions (identity, optional authorize, handler).
 * Lifecycle code resolves full definitions — not raw handler functions alone.
 */

import type {
  ShellCommandDefinition,
  ShellCommandId,
} from "../contract/shell-command-contract"

export interface ShellCommandRegistry {
  getDefinition(commandId: ShellCommandId): ShellCommandDefinition | undefined
}

class StaticShellCommandRegistry implements ShellCommandRegistry {
  readonly #definitions: ReadonlyMap<ShellCommandId, ShellCommandDefinition>

  constructor(definitions: readonly ShellCommandDefinition[]) {
    const map = new Map<ShellCommandId, ShellCommandDefinition>()

    for (const def of definitions) {
      const id = def.commandId.trim()

      if (id.length === 0) {
        throw new Error("Shell command id must not be empty.")
      }

      if (map.has(id)) {
        throw new Error(`Duplicate shell command id "${id}".`)
      }

      map.set(id, def)
    }

    this.#definitions = map
  }

  getDefinition(commandId: ShellCommandId): ShellCommandDefinition | undefined {
    return this.#definitions.get(commandId.trim())
  }
}

export function createShellCommandRegistry(
  definitions: readonly ShellCommandDefinition[]
): ShellCommandRegistry {
  return new StaticShellCommandRegistry(definitions)
}
