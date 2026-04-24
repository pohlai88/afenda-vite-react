import type {
  ClineCapability,
  GovernedClineToolName,
} from "./cline-mode-contract.js"

export const clineCapabilityToolPolicy: Record<
  ClineCapability,
  readonly GovernedClineToolName[]
> = {
  read: ["quickstart", "rank", "report"],
  diagnose: ["verify", "check", "doctor", "validate", "release-check"],
  execute_safe: ["verify", "check", "doctor", "validate", "release-check"],
  plan: ["quickstart", "rank", "report"],
  generate_guarded: ["generate", "scaffold"],
} as const

export function getToolsForCapability(
  capability: ClineCapability
): readonly GovernedClineToolName[] {
  return clineCapabilityToolPolicy[capability]
}
