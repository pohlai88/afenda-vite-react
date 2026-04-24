import { assertMutationBoundary } from "../guards/mutation-boundary-policy.js"
import { assertSafeCommandPolicy } from "../guards/safe-command-policy.js"
import { getGovernedClineTool } from "../tools/index.js"
import { getToolsForCapability } from "./cline-capability-policy.js"
import type {
  ClineOperatorMode,
  GovernedClineToolDefinition,
  GovernedClineToolName,
} from "./cline-mode-contract.js"
import { getCapabilitiesForMode } from "./cline-mode-policy.js"

export class ClineToolAccessError extends Error {
  readonly mode: ClineOperatorMode
  readonly toolName: GovernedClineToolName

  constructor(
    mode: ClineOperatorMode,
    toolName: GovernedClineToolName,
    message: string
  ) {
    super(message)
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
      `Tool ${toolName} is not implemented in the governed Cline phase-1 tool registry.`
    )
  }

  const allowedTools = listAllowedToolsForMode(mode)

  if (!allowedTools.includes(toolName)) {
    throw new ClineToolAccessError(
      mode,
      toolName,
      `Mode ${mode} cannot use tool ${toolName}. Allowed tools: ${allowedTools.join(", ") || "none"}.`
    )
  }

  assertSafeCommandPolicy(tool)
  assertMutationBoundary(mode, tool)

  return tool
}
