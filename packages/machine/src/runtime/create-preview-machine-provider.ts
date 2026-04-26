import type {
  MachineProviderAdapter,
  MachineProviderGenerateInput,
  MachineProviderGenerateResult,
} from "../core/contracts.js"

function buildPreviewResponse(
  input: MachineProviderGenerateInput
): MachineProviderGenerateResult {
  const lastUserMessage =
    input.messages[input.messages.length - 1]?.content ?? ""

  return {
    message: {
      role: "assistant",
      content: `[Lynx preview:${input.skill.id}] ${lastUserMessage}`.trim(),
    },
    metadata: {
      preview: true,
      machineId: input.machineId,
      providerId: "lynx-preview",
    },
  }
}

export function createPreviewMachineProvider(): MachineProviderAdapter {
  return {
    id: "lynx-preview",
    name: "Lynx preview provider",
    generate: async (input) => buildPreviewResponse(input),
  }
}
