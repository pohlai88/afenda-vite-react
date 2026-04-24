import {
  requireSyncPackCommandDefinition,
  type CliCommandDefinition,
} from "../../../../../features-sdk/src/sync-pack/cli/shared.js"
import type {
  ClineCapability,
  GovernedClineToolDefinition,
  GovernedClineToolName,
} from "../mode/cline-mode-contract.js"

function toToolCommand(name: GovernedClineToolName): string {
  return name === "quickstart"
    ? "pnpm run feature-sync"
    : `pnpm run feature-sync:${name}`
}

export function createGovernedCliToolDefinition(
  name: GovernedClineToolName,
  capability: ClineCapability,
  options: {
    readonly mutating?: boolean
  } = {}
): GovernedClineToolDefinition {
  const commandDefinition: CliCommandDefinition =
    requireSyncPackCommandDefinition(name)

  return {
    name,
    capability,
    summary: commandDefinition.summary,
    usage: commandDefinition.usage,
    command: toToolCommand(name),
    mutating: options.mutating ?? false,
    gated: commandDefinition.gate ?? false,
    group: commandDefinition.group,
  }
}
