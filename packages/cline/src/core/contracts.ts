export type ClineCapability =
  | "read"
  | "diagnose"
  | "execute_safe"
  | "plan"
  | "generate_guarded"

export interface ClineToolDefinition<TInput = unknown, TResult = unknown> {
  readonly id: string
  readonly capability: ClineCapability
  readonly summary: string
  readonly usage?: string
  readonly mutating: boolean
  readonly execute?: (input: TInput) => Promise<TResult>
}

export interface ClineResourceDefinition<TResult = unknown> {
  readonly id: string
  readonly summary: string
  readonly resolve: () => Promise<TResult>
}

export interface ClineSafetyPolicy {
  readonly id: string
  readonly summary: string
  readonly assertAllowed: (input: { readonly command: string }) => void
}

export interface ClinePluginManifest {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly tools: readonly ClineToolDefinition[]
  readonly resources?: readonly ClineResourceDefinition[]
  readonly safetyPolicies?: readonly ClineSafetyPolicy[]
}
