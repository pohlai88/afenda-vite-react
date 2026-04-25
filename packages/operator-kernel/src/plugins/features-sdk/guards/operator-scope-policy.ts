import type {
  OperatorModeScopePolicy,
  OperatorMode,
} from "../mode/operator-mode-contract.js"
import { getModeScopePolicy } from "../mode/operator-mode-policy.js"

export function resolveOperatorScopePolicy(
  mode: OperatorMode
): OperatorModeScopePolicy {
  return getModeScopePolicy(mode)
}

export function requiresSingleExactNextCommand(mode: OperatorMode): boolean {
  return resolveOperatorScopePolicy(mode).singleExactNextCommand
}
