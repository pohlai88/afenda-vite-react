import { assertMutationBoundary } from "../guards/mutation-boundary-policy.js"
import { assertSafeCommandPolicy } from "../guards/safe-command-policy.js"
import { GovernedClineError } from "../errors.js"
import { getGovernedClineTool } from "../tools/index.js"
import { getToolsForCapability } from "./cline-capability-policy.js"
import type {
  ClineOperatorMode,
  GovernedClineToolDefinition,
  GovernedClineToolName,
} from "./cline-mode-contract.js"
import { getCapabilitiesForMode } from "./cline-mode-policy.js"

export class ClineToolAccessError extends GovernedClineError {
  readonly mode: ClineOperatorMode
  readonly toolName: GovernedClineToolName

  constructor(
    mode: ClineOperatorMode,
    toolName: GovernedClineToolName,
    message: string,
    options: {
      readonly code: string
      readonly invariant?: string
      readonly doctrine?: string
      readonly resolution?: string
    }
  ) {
    super(message, options)
    this.name = "ClineToolAccessError"
    this.mode = mode
    this.toolName = toolName
  }
}

export function listAllowedToolsForMode(
  mode: ClineOperatorMode
): readonly GovernedClineToolName[] {
  const allowed = new Set<GovernedClineToolName>()

  for (const capability of getCapabilitiesForMode(mode)) {
    for (const toolName of getToolsForCapability(capability)) {
      const tool = getGovernedClineTool(toolName)

      if (!tool) {
        continue
      }

      allowed.add(tool.name)
    }
  }

  return Array.from(allowed)
}

export function assertToolAllowed(
  mode: ClineOperatorMode,
  toolName: GovernedClineToolName
): GovernedClineToolDefinition {
  const tool = getGovernedClineTool(toolName)

  if (!tool) {
    throw new ClineToolAccessError(
      mode,
      toolName,
      `Tool ${toolName} is not implemented in the governed Cline runtime registry.`,
      {
        code: "tool-not-implemented",
        invariant: "ATC-CLINE-TOOLS-001",
        doctrine: "ADR-0009/ATC-0006",
        resolution:
          "Restore registry parity so the declared tool set matches the SDK workflow catalog.",
      }
    )
  }

  const allowedTools = listAllowedToolsForMode(mode)

  if (!allowedTools.includes(toolName)) {
    throw new ClineToolAccessError(
      mode,
      toolName,
      `Mode ${mode} cannot use tool ${toolName}. Allowed tools: ${allowedTools.join(", ") || "none"}.`,
      {
        code: "tool-not-allowed",
        invariant: "ATC-0006",
        doctrine: "ADR-0009/ATC-0006",
        resolution:
          "Use one of the allowed tools for this operator mode or switch to a broader governed mode.",
      }
    )
  }

  assertSafeCommandPolicy(tool)
  assertMutationBoundary(mode, tool)

  return tool
}
