import type {
  OperatorToolDefinition,
  OperatorToolExecutionContext,
} from "../../../core/contracts.js"
import type { SyncPackVerifyResult } from "@afenda/features-sdk/sync-pack"
import {
  OPERATOR_TOOL_NAMES,
  operatorModes,
  type OperatorMode,
  type GovernedOperatorToolName,
} from "../../../runtime/contracts.js"

export { OPERATOR_TOOL_NAMES, operatorModes }
export type {
  OperatorMode,
  GovernedOperatorToolName,
} from "../../../runtime/contracts.js"

export const operatorCapabilities = [
  "read",
  "diagnose",
  "execute_safe",
  "plan",
  "generate_guarded",
] as const

export type OperatorCapability = (typeof operatorCapabilities)[number]

export type OperatorConfidenceGrade = "low" | "medium" | "high"

export interface GovernedOperatorToolDefinition<
  TResult = unknown,
> extends OperatorToolDefinition<unknown, TResult> {
  readonly name: GovernedOperatorToolName
  readonly command: string
  readonly gated: boolean
  readonly group: "start" | "workflow" | "maintainer" | "gate" | "operator"
  readonly execute: (
    input: unknown,
    context: OperatorToolExecutionContext
  ) => Promise<TResult>
}

export interface OperatorModeScopePolicy {
  readonly singleExactNextCommand: boolean
  readonly allowMutation: boolean
  readonly requireGovernedExplanation: boolean
}

export interface ModeAwareVerifyResponse {
  readonly mode: OperatorMode
  readonly confidence: OperatorConfidenceGrade
  readonly summary: string
  readonly explanation: string
  readonly exactNextCommand: string
  readonly allowedTools: readonly GovernedOperatorToolName[]
  readonly failedSteps: readonly string[]
  readonly warningSteps: readonly string[]
  readonly result: SyncPackVerifyResult
}
