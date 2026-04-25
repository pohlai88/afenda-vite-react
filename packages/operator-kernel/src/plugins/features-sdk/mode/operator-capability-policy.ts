import type {
  OperatorCapability,
  GovernedOperatorToolName,
} from "./operator-mode-contract.js"

export const operatorCapabilityToolPolicy: Record<
  OperatorCapability,
  readonly GovernedOperatorToolName[]
> = {
  read: ["quickstart"],
  diagnose: ["release-check", "check", "doctor", "validate"],
  execute_safe: ["verify"],
  plan: ["rank", "report"],
  generate_guarded: ["generate", "scaffold"],
} as const

export function getToolsForCapability(
  capability: OperatorCapability
): readonly GovernedOperatorToolName[] {
  return operatorCapabilityToolPolicy[capability]
}
