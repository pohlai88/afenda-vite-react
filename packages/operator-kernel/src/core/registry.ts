import type {
  OperatorPluginManifest,
  OperatorResourceDefinition,
  OperatorSafetyPolicy,
  OperatorToolDefinition,
} from "./contracts.js"

export interface OperatorRegistry {
  readonly plugins: readonly OperatorPluginManifest[]
  readonly tools: readonly OperatorToolDefinition[]
  readonly resources: readonly OperatorResourceDefinition[]
  readonly safetyPolicies: readonly OperatorSafetyPolicy[]
}

export function createOperatorRegistry(
  plugins: readonly OperatorPluginManifest[]
): OperatorRegistry {
  return {
    plugins,
    tools: plugins.flatMap((plugin) => plugin.tools),
    resources: plugins.flatMap((plugin) => plugin.resources ?? []),
    safetyPolicies: plugins.flatMap((plugin) => plugin.safetyPolicies ?? []),
  }
}
