import { assertMutationBoundary } from "../guards/mutation-boundary-policy.js"
import { assertSafeCommandPolicy } from "../guards/safe-command-policy.js"
import { GovernedOperatorError } from "../errors.js"
import { getGovernedOperatorTool } from "../tools/index.js"
import { getToolsForCapability } from "./operator-capability-policy.js"
import type {
  OperatorMode,
  GovernedOperatorToolDefinition,
  GovernedOperatorToolName,
} from "./operator-mode-contract.js"
import { getCapabilitiesForMode } from "./operator-mode-policy.js"

export class OperatorToolAccessError extends GovernedOperatorError {
  readonly mode: OperatorMode
  readonly toolName: GovernedOperatorToolName

  constructor(
    mode: OperatorMode,
    toolName: GovernedOperatorToolName,
    message: string,
    options: {
      readonly code: string
      readonly invariant?: string
      readonly doctrine?: string
      readonly resolution?: string
    }
  ) {
    super(message, options)
    this.name = "OperatorToolAccessError"
    this.mode = mode
    this.toolName = toolName
  }
}

export function listAllowedToolsForMode(
  mode: OperatorMode
): readonly GovernedOperatorToolName[] {
  const allowed = new Set<GovernedOperatorToolName>()

  for (const capability of getCapabilitiesForMode(mode)) {
    for (const toolName of getToolsForCapability(capability)) {
      const tool = getGovernedOperatorTool(toolName)

      if (!tool) {
        continue
      }

      allowed.add(tool.name)
    }
  }

  return Array.from(allowed)
}

export function assertToolAllowed(
  mode: OperatorMode,
  toolName: GovernedOperatorToolName
): GovernedOperatorToolDefinition {
  const tool = getGovernedOperatorTool(toolName)

  if (!tool) {
    throw new OperatorToolAccessError(
      mode,
      toolName,
      `Tool ${toolName} is not implemented in the governed Operator Kernel runtime registry.`,
      {
        code: "tool-not-implemented",
        invariant: "ATC-OPERATOR-TOOLS-001",
        doctrine: "ADR-0016/ATC-0006",
        resolution:
          "Restore registry parity so the declared tool set matches the SDK workflow catalog.",
      }
    )
  }

  const allowedTools = listAllowedToolsForMode(mode)

  if (!allowedTools.includes(toolName)) {
    throw new OperatorToolAccessError(
      mode,
      toolName,
      `Mode ${mode} cannot use tool ${toolName}. Allowed tools: ${allowedTools.join(", ") || "none"}.`,
      {
        code: "tool-not-allowed",
        invariant: "ATC-0006",
        doctrine: "ADR-0016/ATC-0006",
        resolution:
          "Use one of the allowed tools for this operator mode or switch to a broader governed mode.",
      }
    )
  }

  assertSafeCommandPolicy(tool)
  assertMutationBoundary(mode, tool)

  return tool
}
