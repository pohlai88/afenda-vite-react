import type {
  ClineModeScopePolicy,
  ClineOperatorMode,
} from "../mode/cline-mode-contract.js"
import { getModeScopePolicy } from "../mode/cline-mode-policy.js"

export function resolveOperatorScopePolicy(
  mode: ClineOperatorMode
): ClineModeScopePolicy {
  return getModeScopePolicy(mode)
}

export function requiresSingleExactNextCommand(
  mode: ClineOperatorMode
): boolean {
  return resolveOperatorScopePolicy(mode).singleExactNextCommand
}
