import type {
  ClinePluginManifest,
  ClineResourceDefinition,
  ClineSafetyPolicy,
  ClineToolDefinition,
} from "./contracts.js"

export interface ClineRegistry {
  readonly plugins: readonly ClinePluginManifest[]
  readonly tools: readonly ClineToolDefinition[]
  readonly resources: readonly ClineResourceDefinition[]
  readonly safetyPolicies: readonly ClineSafetyPolicy[]
}

export function createClineRegistry(
  plugins: readonly ClinePluginManifest[]
): ClineRegistry {
  return {
    plugins,
    tools: plugins.flatMap((plugin) => plugin.tools),
    resources: plugins.flatMap((plugin) => plugin.resources ?? []),
    safetyPolicies: plugins.flatMap((plugin) => plugin.safetyPolicies ?? []),
  }
}
