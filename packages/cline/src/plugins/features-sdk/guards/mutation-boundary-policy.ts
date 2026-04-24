import type {
  ClineOperatorMode,
  GovernedClineToolDefinition,
} from "../mode/cline-mode-contract.js"
import { resolveOperatorScopePolicy } from "./operator-scope-policy.js"

export function isMutationAllowedForMode(mode: ClineOperatorMode): boolean {
  return resolveOperatorScopePolicy(mode).allowMutation
}

export function assertMutationBoundary(
  mode: ClineOperatorMode,
  tool: GovernedClineToolDefinition
): void {
  if (!tool.mutating) {
    return
  }

  if (!isMutationAllowedForMode(mode)) {
    throw new Error(
      `Mode ${mode} cannot use mutating tool ${tool.name}. Governed mutation is not allowed in this operator scope.`
    )
  }
}
