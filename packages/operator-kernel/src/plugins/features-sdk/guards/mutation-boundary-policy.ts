import type {
  OperatorMode,
  GovernedOperatorToolDefinition,
} from "../mode/operator-mode-contract.js"
import { GovernedOperatorError } from "../errors.js"
import { resolveOperatorScopePolicy } from "./operator-scope-policy.js"

export function isMutationAllowedForMode(mode: OperatorMode): boolean {
  return resolveOperatorScopePolicy(mode).allowMutation
}

export function assertMutationBoundary(
  mode: OperatorMode,
  tool: GovernedOperatorToolDefinition
): void {
  if (!tool.mutating) {
    return
  }

  if (!isMutationAllowedForMode(mode)) {
    throw new GovernedOperatorError(
      `Mode ${mode} cannot use mutating tool ${tool.name}. Governed mutation is not allowed in this operator scope.`,
      {
        code: "mutation-blocked",
        invariant: "ATC-0006",
        doctrine: "ADR-0016/ATC-0006",
        resolution:
          "Use architect_commander for mutating generate/scaffold operations.",
      }
    )
  }
}
