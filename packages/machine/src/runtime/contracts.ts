import type {
  MachineConversationContext,
  MachineMessage,
  MachineManifest,
  MachineProviderAdapter,
  MachineProviderGenerateResult,
  MachineSkillDefinition,
} from "../core/contracts.js"
import type { MachineRegistry } from "../core/registry.js"

export const LYNX_MACHINE_ID = "lynx" as const

export interface MachineSchema<TValue> {
  readonly parse: (input: unknown) => TValue
}

function assertRecord(input: unknown, label: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(`${label} must be an object.`)
  }

  return input as Record<string, unknown>
}

function parseOptionalString(input: unknown): string | undefined {
  if (input === undefined) {
    return undefined
  }

  if (typeof input !== "string") {
    throw new Error("Expected a string value.")
  }

  return input
}

function parseMetadata(input: unknown): Record<string, unknown> | undefined {
  if (input === undefined) {
    return undefined
  }

  return assertRecord(input, "metadata")
}

function parseMachineMessage(input: unknown): MachineMessage {
  const record = assertRecord(input, "Machine message")
  const role = record.role

  if (
    role !== "system" &&
    role !== "user" &&
    role !== "assistant" &&
    role !== "tool"
  ) {
    throw new Error("Machine message role is invalid.")
  }

  const content = record.content
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("Machine message content must be a non-empty string.")
  }

  return {
    id: parseOptionalString(record.id),
    role,
    content,
    name: parseOptionalString(record.name),
    metadata: parseMetadata(record.metadata),
  }
}

function parseMachineConversationContextValue(
  input: unknown
): MachineConversationContext {
  const record = assertRecord(input, "Machine conversation context")
  const conversationId = record.conversationId

  if (typeof conversationId !== "string" || conversationId.length === 0) {
    throw new Error("conversationId must be a non-empty string.")
  }

  return {
    conversationId,
    tenantId: parseOptionalString(record.tenantId),
    userId: parseOptionalString(record.userId),
    locale: parseOptionalString(record.locale),
    market: parseOptionalString(record.market),
    moduleId: parseOptionalString(record.moduleId),
    metadata: parseMetadata(record.metadata),
  }
}

export interface MachineExecuteInput {
  readonly skillId: string
  readonly prompt: string
  readonly context: MachineConversationContext
  readonly history: readonly MachineMessage[]
}

function parseMachineExecuteInputValue(input: unknown): MachineExecuteInput {
  const record = assertRecord(input, "Machine execute input")
  const skillId = record.skillId
  const prompt = record.prompt

  if (typeof skillId !== "string" || skillId.length === 0) {
    throw new Error("skillId must be a non-empty string.")
  }

  if (typeof prompt !== "string" || prompt.length === 0) {
    throw new Error("prompt must be a non-empty string.")
  }

  const historyInput = record.history
  const history = Array.isArray(historyInput)
    ? historyInput.map((message) => parseMachineMessage(message))
    : []

  return {
    skillId,
    prompt,
    context: parseMachineConversationContextValue(record.context),
    history,
  }
}

export const MachineMessageSchema: MachineSchema<MachineMessage> = {
  parse: parseMachineMessage,
}

export const MachineConversationContextSchema: MachineSchema<MachineConversationContext> =
  {
    parse: parseMachineConversationContextValue,
  }

export const MachineExecuteInputSchema: MachineSchema<MachineExecuteInput> = {
  parse: parseMachineExecuteInputValue,
}

export type MachineExecuteOutput =
  | {
      readonly ok: true
      readonly machineId: typeof LYNX_MACHINE_ID
      readonly skillId: string
      readonly prepared: {
        readonly systemPrompt: string
        readonly contextBlock?: string
      }
      readonly result: MachineProviderGenerateResult
    }
  | {
      readonly ok: false
      readonly machineId: typeof LYNX_MACHINE_ID
      readonly skillId: string
      readonly error: {
        readonly code: string
        readonly message: string
      }
    }

export function parseMachineExecuteInput(input: unknown): MachineExecuteInput {
  return MachineExecuteInputSchema.parse(input)
}

export interface LynxMachineRuntime {
  readonly machineId: typeof LYNX_MACHINE_ID
  readonly registry: MachineRegistry
  readonly provider: MachineProviderAdapter
  readonly execute: (
    input: MachineExecuteInput
  ) => Promise<MachineExecuteOutput>
}

export interface CreateLynxMachineRuntimeInput {
  readonly provider: MachineProviderAdapter
  readonly manifests: readonly MachineManifest[]
  readonly baseSystemPrompt?: string
}

export interface BuildLynxSystemPromptInput {
  readonly baseSystemPrompt?: string
  readonly skill: MachineSkillDefinition
  readonly context: MachineConversationContext
  readonly contextBlock?: string
}
