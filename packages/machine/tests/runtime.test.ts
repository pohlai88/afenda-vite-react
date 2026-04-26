import { describe, expect, it, vi } from "vitest"

import type { MachineProviderAdapter } from "../src/core/contracts.js"
import {
  LYNX_MACHINE_ID,
  createLynxMachineRuntime,
} from "../src/runtime/index.js"

describe("createLynxMachineRuntime", () => {
  it("prepares a Lynx turn and delegates to the provider", async () => {
    const provider: MachineProviderAdapter = {
      id: "test-provider",
      name: "Test provider",
      generate: vi.fn(async (input) => ({
        message: {
          role: "assistant" as const,
          content: `Handled ${input.skill.id}`,
        },
        metadata: {
          echoedSystemPrompt: input.systemPrompt,
        },
      })),
    }

    const runtime = createLynxMachineRuntime({ provider })
    const result = await runtime.execute({
      skillId: "general",
      prompt: "Summarize the active tenant state.",
      context: {
        conversationId: "conv-1",
        tenantId: "tenant-1",
        locale: "en",
        market: "sg",
      },
      history: [],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error("Expected Lynx runtime success.")
    }

    expect(result.machineId).toBe(LYNX_MACHINE_ID)
    expect(result.skillId).toBe("general")
    expect(result.prepared.systemPrompt).toContain("You are Lynx")
    expect(result.result.message.content).toBe("Handled general")
    expect(provider.generate).toHaveBeenCalledTimes(1)
  })

  it("returns a bounded error when the skill does not exist", async () => {
    const runtime = createLynxMachineRuntime({
      provider: {
        id: "test-provider",
        name: "Test provider",
        generate: async () => {
          throw new Error("Provider should not be called.")
        },
      },
    })

    const result = await runtime.execute({
      skillId: "missing",
      prompt: "Hello",
      context: {
        conversationId: "conv-2",
      },
      history: [],
    })

    expect(result.ok).toBe(false)
    if (result.ok) {
      throw new Error("Expected Lynx runtime failure.")
    }

    expect(result.error.code).toBe("MACHINE_SKILL_NOT_FOUND")
  })
})
