import type { SyncPackVerifyResult } from "@afenda/features-sdk"

export const clineOperatorModes = [
  "guided_operator",
  "feature_devops",
  "architect_commander",
] as const

export type ClineOperatorMode = (typeof clineOperatorModes)[number]

export const clineCapabilities = [
  "read",
  "diagnose",
  "execute_safe",
  "plan",
  "generate_guarded",
] as const

export type ClineCapability = (typeof clineCapabilities)[number]

export const governedClineToolNames = [
  "quickstart",
  "verify",
  "check",
  "doctor",
  "validate",
  "release-check",
  "rank",
  "report",
  "scaffold",
  "generate",
] as const

export type GovernedClineToolName = (typeof governedClineToolNames)[number]

export type ClineConfidenceGrade = "low" | "medium" | "high"

export interface GovernedClineToolDefinition {
  readonly name: GovernedClineToolName
  readonly capability: ClineCapability
  readonly summary: string
  readonly usage: string
  readonly command: string
  readonly mutating: boolean
  readonly gated: boolean
  readonly group: "start" | "workflow" | "maintainer" | "gate" | "operator"
}

export interface ClineModeScopePolicy {
  readonly singleExactNextCommand: boolean
  readonly allowMutation: boolean
  readonly requireGovernedExplanation: boolean
}

export interface ModeAwareVerifyResponse {
  readonly mode: ClineOperatorMode
  readonly confidence: ClineConfidenceGrade
  readonly summary: string
  readonly explanation: string
  readonly exactNextCommand: string
  readonly allowedTools: readonly GovernedClineToolName[]
  readonly failedSteps: readonly string[]
  readonly warningSteps: readonly string[]
  readonly result: SyncPackVerifyResult
}
