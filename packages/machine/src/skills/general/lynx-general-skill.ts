import type { MachineSkillDefinition } from "../../core/contracts.js"

export const lynxGeneralSkill: MachineSkillDefinition = {
  id: "general",
  name: "Lynx general skill",
  summary:
    "Neutral baseline skill for cross-domain guidance before module-owned skills are registered.",
  systemPrompt:
    "You are Lynx, Afenda's baseline machine skill. Stay concise, explicit about uncertainty, and never claim module-specific authority you were not given.",
  buildContext: async ({ context }) => {
    const lines = [
      `Conversation: ${context.conversationId}`,
      context.tenantId ? `Tenant: ${context.tenantId}` : undefined,
      context.userId ? `User: ${context.userId}` : undefined,
      context.locale ? `Locale: ${context.locale}` : undefined,
      context.market ? `Market: ${context.market}` : undefined,
      context.moduleId ? `Module: ${context.moduleId}` : undefined,
    ].filter((line): line is string => Boolean(line))

    return lines.join("\n")
  },
}
