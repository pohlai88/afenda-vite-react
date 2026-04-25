import type { ClineToolDefinition } from "../core/contracts.js"
import type { ClineRegistry } from "../core/registry.js"

export const clineOperatorModes = [
  "guided_operator",
  "feature_devops",
  "architect_commander",
] as const

export type ClineOperatorMode = (typeof clineOperatorModes)[number]

export const CLINE_TOOL_NAMES = [
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

export type GovernedClineToolName = (typeof CLINE_TOOL_NAMES)[number]

export type ClineExecuteOutput<TResult = unknown> =
  | {
      readonly ok: true
      readonly tool: GovernedClineToolName
      readonly data: TResult
      readonly explanation?: string
      readonly nextActions: readonly string[]
    }
  | {
      readonly ok: false
      readonly tool: GovernedClineToolName
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

export interface ClineExecuteInput {
  readonly tool: GovernedClineToolName
  readonly mode: ClineOperatorMode
  readonly workspaceRoot: string
  readonly input: unknown
}

export interface ClineRuntime {
  readonly registry: ClineRegistry
  readonly getTool: (
    id: GovernedClineToolName
  ) => ClineToolDefinition | undefined
  readonly execute: (input: ClineExecuteInput) => Promise<ClineExecuteOutput>
}
