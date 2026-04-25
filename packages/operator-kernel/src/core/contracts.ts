export type OperatorCapability =
  | "read"
  | "diagnose"
  | "execute_safe"
  | "plan"
  | "generate_guarded"

export interface OperatorToolDefinition<TInput = unknown, TResult = unknown> {
  readonly id: string
  readonly capability: OperatorCapability
  readonly summary: string
  readonly usage?: string
  readonly mutating: boolean
  readonly execute?: (
    input: TInput,
    context: OperatorToolExecutionContext
  ) => Promise<TResult>
}

export interface OperatorToolExecutionContext {
  readonly workspaceRoot: string
}

export interface OperatorResourceDefinition<TResult = unknown> {
  readonly id: string
  readonly summary: string
  readonly resolve: () => Promise<TResult>
}

export interface OperatorSafetyPolicy {
  readonly id: string
  readonly summary: string
  readonly assertAllowed: (input: { readonly command: string }) => void
}

export interface OperatorPluginManifest {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly tools: readonly OperatorToolDefinition[]
  readonly resources?: readonly OperatorResourceDefinition[]
  readonly safetyPolicies?: readonly OperatorSafetyPolicy[]
}
