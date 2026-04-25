import type {
  SyncPackQuickstartResult,
  SyncPackVerifyResult,
} from "@afenda/features-sdk/sync-pack"

import { createOperatorOrchestrator } from "../core/orchestrator.js"
import { createModeAwareVerifyResponse } from "../plugins/features-sdk/explain/mode-aware-response.js"
import { GovernedOperatorError } from "../plugins/features-sdk/errors.js"
import {
  OperatorToolAccessError,
  assertToolAllowed,
} from "../plugins/features-sdk/mode/assert-tool-allowed.js"
import type { GovernedOperatorToolDefinition } from "../plugins/features-sdk/mode/operator-mode-contract.js"
import { featuresSdkOperatorPlugin } from "../plugins/features-sdk/plugin.js"

import type {
  OperatorExecuteInput,
  OperatorExecuteOutput,
  OperatorRuntime,
  GovernedOperatorToolName,
} from "./contracts.js"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function injectRuntimeContext(
  toolName: GovernedOperatorToolName,
  input: unknown,
  workspaceRoot: string
): unknown {
  const recordInput = isRecord(input) ? input : {}

  switch (toolName) {
    case "quickstart":
    case "verify":
    case "release-check":
    case "doctor":
    case "scaffold":
      return {
        ...recordInput,
        workspaceRoot:
          typeof recordInput.workspaceRoot === "string"
            ? recordInput.workspaceRoot
            : workspaceRoot,
      }
    default:
      return input
  }
}

function isSyncPackVerifyResult(value: unknown): value is SyncPackVerifyResult {
  return (
    isRecord(value) &&
    Array.isArray(value.steps) &&
    typeof value.verdict === "string" &&
    typeof value.errorCount === "number" &&
    typeof value.warningCount === "number"
  )
}

function isSyncPackQuickstartResult(
  value: unknown
): value is SyncPackQuickstartResult {
  return (
    isRecord(value) &&
    typeof value.recommendedNextAction === "string" &&
    Array.isArray(value.releaseGateCommands) &&
    Array.isArray(value.maintainerCommands)
  )
}

function createSuccessOutput<TResult>(
  tool: GovernedOperatorToolDefinition,
  data: TResult,
  explanation?: string,
  nextActions?: readonly string[]
): OperatorExecuteOutput<TResult> {
  return {
    ok: true,
    tool: tool.name,
    data,
    explanation,
    nextActions: nextActions ?? [tool.command],
  }
}

function createErrorOutput(
  toolName: GovernedOperatorToolName,
  error: unknown,
  nextActions: readonly string[]
): OperatorExecuteOutput {
  if (error instanceof GovernedOperatorError) {
    return {
      ok: false,
      tool: toolName,
      error: {
        code: error.code,
        message: error.message,
        invariant: error.invariant,
        doctrine: error.doctrine,
        resolution: error.resolution,
      },
      explanation: error.message,
      nextActions,
    }
  }

  if (error instanceof Error) {
    return {
      ok: false,
      tool: toolName,
      error: {
        code: "runtime-execution-failed",
        message: error.message,
      },
      explanation: error.message,
      nextActions,
    }
  }

  return {
    ok: false,
    tool: toolName,
    error: {
      code: "runtime-execution-failed",
      message: String(error),
    },
    explanation: String(error),
    nextActions,
  }
}

function buildNonVerifyExplanation(
  tool: GovernedOperatorToolDefinition
): string {
  if (tool.name === "quickstart") {
    return "Quickstart stays bound to the Sync-Pack truth engine and recommends the supported next operator step."
  }

  return `Executed ${tool.name} through the public @afenda/features-sdk/sync-pack workflow catalog.`
}

export function createDefaultOperatorRuntime(): OperatorRuntime {
  const orchestrator = createOperatorOrchestrator([featuresSdkOperatorPlugin])

  return {
    registry: orchestrator.registry,
    getTool: (id) => orchestrator.getTool(id),
    async execute(input: OperatorExecuteInput): Promise<OperatorExecuteOutput> {
      let tool: GovernedOperatorToolDefinition

      try {
        tool = assertToolAllowed(input.mode, input.tool)
      } catch (error) {
        return createErrorOutput(input.tool, error, [])
      }

      if (!tool.execute) {
        return createErrorOutput(
          input.tool,
          new OperatorToolAccessError(
            input.mode,
            input.tool,
            `Tool ${input.tool} is declared but missing its governed runtime executor.`,
            {
              code: "tool-registry-drift",
              invariant: "ATC-OPERATOR-TOOLS-001",
              doctrine: "ADR-0016/ATC-0006",
              resolution:
                "Restore the missing runtime executor so the declared tool set matches the SDK workflow catalog.",
            }
          ),
          []
        )
      }

      try {
        const data = await tool.execute(
          injectRuntimeContext(input.tool, input.input, input.workspaceRoot),
          {
            workspaceRoot: input.workspaceRoot,
          }
        )

        if (isSyncPackVerifyResult(data)) {
          const response = createModeAwareVerifyResponse(input.mode, data)

          return createSuccessOutput(tool, data, response.explanation, [
            response.exactNextCommand,
          ])
        }

        if (isSyncPackQuickstartResult(data)) {
          return createSuccessOutput(
            tool,
            data,
            buildNonVerifyExplanation(tool),
            [data.recommendedNextAction]
          )
        }

        return createSuccessOutput(tool, data, buildNonVerifyExplanation(tool))
      } catch (error) {
        return createErrorOutput(input.tool, error, [tool.command])
      }
    },
  }
}
