import type {
  OperatorPluginManifest,
  OperatorToolDefinition,
} from "./contracts.js"
import { createOperatorRegistry, type OperatorRegistry } from "./registry.js"

export interface OperatorOrchestrator {
  readonly registry: OperatorRegistry
  readonly getTool: (id: string) => OperatorToolDefinition | undefined
}

export function createOperatorOrchestrator(
  plugins: readonly OperatorPluginManifest[]
): OperatorOrchestrator {
  const registry = createOperatorRegistry(plugins)

  return {
    registry,
    getTool: (id) => registry.tools.find((tool) => tool.id === id),
  }
}
