import type {
  SyncPackQuickstartResult,
  SyncPackVerifyResult,
} from "@afenda/features-sdk/sync-pack"

import { createClineOrchestrator } from "../core/orchestrator.js"
import { createModeAwareVerifyResponse } from "../plugins/features-sdk/explain/mode-aware-response.js"
import { GovernedClineError } from "../plugins/features-sdk/errors.js"
import {
  ClineToolAccessError,
  assertToolAllowed,
} from "../plugins/features-sdk/mode/assert-tool-allowed.js"
import type { GovernedClineToolDefinition } from "../plugins/features-sdk/mode/cline-mode-contract.js"
import { featuresSdkClinePlugin } from "../plugins/features-sdk/plugin.js"

import type {
  ClineExecuteInput,
  ClineExecuteOutput,
  ClineRuntime,
  GovernedClineToolName,
} from "./contracts.js"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function injectRuntimeContext(
  toolName: GovernedClineToolName,
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
  tool: GovernedClineToolDefinition,
  data: TResult,
  explanation?: string,
  nextActions?: readonly string[]
): ClineExecuteOutput<TResult> {
  return {
    ok: true,
    tool: tool.name,
    data,
    explanation,
    nextActions: nextActions ?? [tool.command],
  }
}

function createErrorOutput(
  toolName: GovernedClineToolName,
  error: unknown,
  nextActions: readonly string[]
): ClineExecuteOutput {
  if (error instanceof GovernedClineError) {
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

function buildNonVerifyExplanation(tool: GovernedClineToolDefinition): string {
  if (tool.name === "quickstart") {
    return "Quickstart stays bound to the Sync-Pack truth engine and recommends the supported next operator step."
  }

  return `Executed ${tool.name} through the public @afenda/features-sdk/sync-pack workflow catalog.`
}

export function createDefaultClineRuntime(): ClineRuntime {
  const orchestrator = createClineOrchestrator([featuresSdkClinePlugin])

  return {
    registry: orchestrator.registry,
    getTool: (id) => orchestrator.getTool(id),
    async execute(input: ClineExecuteInput): Promise<ClineExecuteOutput> {
      let tool: GovernedClineToolDefinition

      try {
        tool = assertToolAllowed(input.mode, input.tool)
      } catch (error) {
        return createErrorOutput(input.tool, error, [])
      }

      if (!tool.execute) {
        return createErrorOutput(
          input.tool,
          new ClineToolAccessError(
            input.mode,
            input.tool,
            `Tool ${input.tool} is declared but missing its governed runtime executor.`,
            {
              code: "tool-registry-drift",
              invariant: "ATC-CLINE-TOOLS-001",
              doctrine: "ADR-0009/ATC-0006",
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
