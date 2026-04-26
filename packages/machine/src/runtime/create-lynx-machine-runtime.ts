import type {
  MachineManifest,
  MachineConversationContext,
  MachineMessage,
  MachineSkillDefinition,
} from "../core/contracts.js"
import { createMachineRegistry } from "../core/registry.js"
import { lynxCoreManifest } from "../skills/index.js"

import {
  LYNX_MACHINE_ID,
  parseMachineExecuteInput,
  type BuildLynxSystemPromptInput,
  type CreateLynxMachineRuntimeInput,
  type LynxMachineRuntime,
  type MachineExecuteOutput,
} from "./contracts.js"

const DEFAULT_LYNX_SYSTEM_PROMPT =
  "You are Lynx, Afenda's governed machine runtime. Stay bounded, do not invent enterprise facts, and keep domain ownership explicit."

export function buildLynxSystemPrompt(
  input: BuildLynxSystemPromptInput
): string {
  const lines = [
    input.baseSystemPrompt ?? DEFAULT_LYNX_SYSTEM_PROMPT,
    input.skill.systemPrompt,
  ]

  if (input.context.moduleId) {
    lines.push(`Module: ${input.context.moduleId}`)
  }

  if (input.context.locale) {
    lines.push(`Locale: ${input.context.locale}`)
  }

  if (input.context.market) {
    lines.push(`Market: ${input.context.market}`)
  }

  if (input.contextBlock) {
    lines.push("--- Context ---")
    lines.push(input.contextBlock)
  }

  return lines.join("\n\n")
}

async function buildSkillContext(
  skill: MachineSkillDefinition,
  input: {
    readonly context: MachineConversationContext
    readonly prompt: string
    readonly history: readonly MachineMessage[]
  }
): Promise<string | undefined> {
  if (!skill.buildContext) {
    return undefined
  }

  return skill.buildContext({
    context: input.context,
    prompt: input.prompt,
    history: input.history,
  })
}

export function createLynxMachineRuntime(
  input: Omit<CreateLynxMachineRuntimeInput, "manifests"> & {
    readonly manifests?: readonly MachineManifest[]
  }
): LynxMachineRuntime {
  const manifests = input.manifests ?? [lynxCoreManifest]
  const registry = createMachineRegistry(manifests)

  return {
    machineId: LYNX_MACHINE_ID,
    registry,
    provider: input.provider,
    execute: async (rawInput) => {
      const parsed = parseMachineExecuteInput(rawInput)
      const skill = registry.getSkill(parsed.skillId)

      if (!skill) {
        return {
          ok: false,
          machineId: LYNX_MACHINE_ID,
          skillId: parsed.skillId,
          error: {
            code: "MACHINE_SKILL_NOT_FOUND",
            message: `Machine skill "${parsed.skillId}" is not registered in Lynx.`,
          },
        } satisfies MachineExecuteOutput
      }

      const contextBlock = await buildSkillContext(skill, {
        context: parsed.context,
        prompt: parsed.prompt,
        history: parsed.history,
      })
      const systemPrompt = buildLynxSystemPrompt({
        baseSystemPrompt: input.baseSystemPrompt,
        skill,
        context: parsed.context,
        contextBlock,
      })
      const messages: readonly MachineMessage[] = [
        ...parsed.history,
        {
          role: "user",
          content: parsed.prompt,
        },
      ]
      const result = await input.provider.generate({
        machineId: LYNX_MACHINE_ID,
        skill,
        context: parsed.context,
        systemPrompt,
        messages,
        tools: skill.tools ?? [],
      })

      return {
        ok: true,
        machineId: LYNX_MACHINE_ID,
        skillId: skill.id,
        prepared: {
          systemPrompt,
          contextBlock,
        },
        result,
      } satisfies MachineExecuteOutput
    },
  }
}
