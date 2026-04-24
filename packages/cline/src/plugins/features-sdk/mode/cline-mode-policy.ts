import type {
  ClineCapability,
  ClineModeScopePolicy,
  ClineOperatorMode,
} from "./cline-mode-contract.js"

export const clineModeCapabilityPolicy: Record<
  ClineOperatorMode,
  readonly ClineCapability[]
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

export const clineModeScopePolicy: Record<
  ClineOperatorMode,
  ClineModeScopePolicy
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
  mode: ClineOperatorMode
): readonly ClineCapability[] {
  return clineModeCapabilityPolicy[mode]
}

export function getModeScopePolicy(
  mode: ClineOperatorMode
): ClineModeScopePolicy {
  return clineModeScopePolicy[mode]
}
