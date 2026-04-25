import type {
  ClineToolDefinition,
  ClineToolExecutionContext,
} from "../../../core/contracts.js"
import type { SyncPackVerifyResult } from "@afenda/features-sdk/sync-pack"
import {
  CLINE_TOOL_NAMES,
  clineOperatorModes,
  type ClineOperatorMode,
  type GovernedClineToolName,
} from "../../../runtime/contracts.js"

export { CLINE_TOOL_NAMES, clineOperatorModes }
export type {
  ClineOperatorMode,
  GovernedClineToolName,
} from "../../../runtime/contracts.js"

export const clineCapabilities = [
  "read",
  "diagnose",
  "execute_safe",
  "plan",
  "generate_guarded",
] as const

export type ClineCapability = (typeof clineCapabilities)[number]

export type ClineConfidenceGrade = "low" | "medium" | "high"

export interface GovernedClineToolDefinition<
  TResult = unknown,
> extends ClineToolDefinition<unknown, TResult> {
  readonly name: GovernedClineToolName
  readonly command: string
  readonly gated: boolean
  readonly group: "start" | "workflow" | "maintainer" | "gate" | "operator"
  readonly execute: (
    input: unknown,
    context: ClineToolExecutionContext
  ) => Promise<TResult>
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
