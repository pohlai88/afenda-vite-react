import type {
  OperatorCapability,
  OperatorModeScopePolicy,
  OperatorMode,
} from "./operator-mode-contract.js"

export const operatorModeCapabilityPolicy: Record<
  OperatorMode,
  readonly OperatorCapability[]
> = {
  guided_operator: ["read", "diagnose", "execute_safe"],
  feature_devops: ["read", "diagnose", "execute_safe", "plan"],
  architect_commander: [
    "read",
    "diagnose",
    "execute_safe",
    "plan",
    "generate_guarded",
  ],
} as const

export const operatorModeScopePolicy: Record<
  OperatorMode,
  OperatorModeScopePolicy
> = {
  guided_operator: {
    singleExactNextCommand: true,
    allowMutation: false,
    requireGovernedExplanation: true,
  },
  feature_devops: {
    singleExactNextCommand: false,
    allowMutation: false,
    requireGovernedExplanation: true,
  },
  architect_commander: {
    singleExactNextCommand: false,
    allowMutation: true,
    requireGovernedExplanation: true,
  },
} as const

export function getCapabilitiesForMode(
  mode: OperatorMode
): readonly OperatorCapability[] {
  return operatorModeCapabilityPolicy[mode]
}

export function getModeScopePolicy(
  mode: OperatorMode
): OperatorModeScopePolicy {
  return operatorModeScopePolicy[mode]
}
