import type {
  ClineCapability,
  GovernedClineToolName,
} from "./cline-mode-contract.js"

export const clineCapabilityToolPolicy: Record<
  ClineCapability,
  readonly GovernedClineToolName[]
> = {
  read: ["quickstart"],
  diagnose: ["release-check", "check", "doctor", "validate"],
  execute_safe: ["verify"],
  plan: ["rank", "report"],
  generate_guarded: ["generate", "scaffold"],
} as const

export function getToolsForCapability(
  capability: ClineCapability
): readonly GovernedClineToolName[] {
  return clineCapabilityToolPolicy[capability]
}
