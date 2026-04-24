import type { ClinePluginManifest, ClineToolDefinition } from "./contracts.js"
import { createClineRegistry, type ClineRegistry } from "./registry.js"

export interface ClineOrchestrator {
  readonly registry: ClineRegistry
  readonly getTool: (id: string) => ClineToolDefinition | undefined
}

export function createClineOrchestrator(
  plugins: readonly ClinePluginManifest[]
): ClineOrchestrator {
  const registry = createClineRegistry(plugins)

  return {
    registry,
    getTool: (id) => registry.tools.find((tool) => tool.id === id),
  }
}
