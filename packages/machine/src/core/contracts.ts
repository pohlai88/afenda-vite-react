export type MachineMessageRole = "system" | "user" | "assistant" | "tool"

export interface MachineMessage {
  readonly id?: string
  readonly role: MachineMessageRole
  readonly content: string
  readonly name?: string
  readonly metadata?: Record<string, unknown>
}

export interface MachineConversationContext {
  readonly conversationId: string
  readonly tenantId?: string
  readonly userId?: string
  readonly locale?: string
  readonly market?: string
  readonly moduleId?: string
  readonly metadata?: Record<string, unknown>
}

export interface MachineContextBuildInput {
  readonly context: MachineConversationContext
  readonly prompt: string
  readonly history: readonly MachineMessage[]
}

export interface MachineToolExecutionContext {
  readonly machineId: string
  readonly skillId: string
  readonly context: MachineConversationContext
}

export interface MachineToolDefinition<TInput = unknown, TResult = unknown> {
  readonly id: string
  readonly summary: string
  readonly mutating?: boolean
  readonly execute?: (
    input: TInput,
    context: MachineToolExecutionContext
  ) => Promise<TResult>
}

export interface MachineSkillDefinition {
  readonly id: string
  readonly name: string
  readonly summary: string
  readonly systemPrompt: string
  readonly tools?: readonly MachineToolDefinition[]
  readonly buildContext?: (
    input: MachineContextBuildInput
  ) => Promise<string | undefined>
}

export interface MachineManifest {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly skills: readonly MachineSkillDefinition[]
}

export interface MachineProviderToolCall {
  readonly id: string
  readonly toolId: string
  readonly input: Record<string, unknown>
}

export interface MachineProviderUsage {
  readonly inputTokens?: number
  readonly outputTokens?: number
}

export interface MachineProviderGenerateInput {
  readonly machineId: string
  readonly skill: MachineSkillDefinition
  readonly context: MachineConversationContext
  readonly systemPrompt: string
  readonly messages: readonly MachineMessage[]
  readonly tools: readonly MachineToolDefinition[]
}

export interface MachineProviderGenerateResult {
  readonly message: MachineMessage
  readonly toolCalls?: readonly MachineProviderToolCall[]
  readonly usage?: MachineProviderUsage
  readonly metadata?: Record<string, unknown>
}

export interface MachineProviderAdapter {
  readonly id: string
  readonly name: string
  readonly generate: (
    input: MachineProviderGenerateInput
  ) => Promise<MachineProviderGenerateResult>
}
