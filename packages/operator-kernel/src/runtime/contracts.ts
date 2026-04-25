import { z } from "zod"

import type { OperatorToolDefinition } from "../core/contracts.js"
import type { OperatorRegistry } from "../core/registry.js"

export const operatorModes = [
  "guided_operator",
  "feature_devops",
  "architect_commander",
] as const

export type OperatorMode = (typeof operatorModes)[number]

export const OperatorModeSchema = z.enum(operatorModes)

export const OPERATOR_TOOL_NAMES = [
  "quickstart",
  "verify",
  "release-check",
  "check",
  "doctor",
  "validate",
  "rank",
  "report",
  "generate",
  "scaffold",
] as const

export type GovernedOperatorToolName = (typeof OPERATOR_TOOL_NAMES)[number]

export const GovernedOperatorToolNameSchema = z.enum(OPERATOR_TOOL_NAMES)

export const OperatorExecuteInputSchema = z.object({
  tool: GovernedOperatorToolNameSchema,
  mode: OperatorModeSchema,
  workspaceRoot: z.string().min(1),
  input: z.unknown(),
})

export type OperatorExecuteOutput<TResult = unknown> =
  | {
      readonly ok: true
      readonly tool: GovernedOperatorToolName
      readonly data: TResult
      readonly explanation?: string
      readonly nextActions: readonly string[]
    }
  | {
      readonly ok: false
      readonly tool: GovernedOperatorToolName
      readonly error: {
        readonly code: string
        readonly message: string
        readonly invariant?: string
        readonly doctrine?: string
        readonly resolution?: string
      }
      readonly explanation?: string
      readonly nextActions: readonly string[]
    }

export interface OperatorExecuteInput {
  readonly tool: GovernedOperatorToolName
  readonly mode: OperatorMode
  readonly workspaceRoot: string
  readonly input: unknown
}

export function parseOperatorExecuteInput(
  input: unknown
): OperatorExecuteInput {
  return OperatorExecuteInputSchema.parse(input)
}

export interface OperatorRuntime {
  readonly registry: OperatorRegistry
  readonly getTool: (
    id: GovernedOperatorToolName
  ) => OperatorToolDefinition | undefined
  readonly execute: (
    input: OperatorExecuteInput
  ) => Promise<OperatorExecuteOutput>
}
