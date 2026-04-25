import {
  syncPackWorkflowCatalog,
  type SyncPackWorkflowName,
} from "@afenda/features-sdk/sync-pack"

import {
  OPERATOR_TOOL_NAMES,
  type GovernedOperatorToolName,
} from "../../../runtime/contracts.js"
import type { GovernedOperatorToolDefinition } from "../mode/operator-mode-contract.js"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toToolCommand(name: GovernedOperatorToolName): string {
  return name === "quickstart"
    ? "pnpm run feature-sync"
    : `pnpm run feature-sync:${name}`
}

function createGovernedToolDefinition(
  name: GovernedOperatorToolName
): GovernedOperatorToolDefinition {
  const workflow = syncPackWorkflowCatalog[name as SyncPackWorkflowName]
  const executeWorkflow = workflow.execute as (
    input: unknown
  ) => Promise<unknown>

  return {
    id: name,
    name,
    capability: workflow.capability,
    summary: workflow.summary,
    usage: workflow.usage,
    command: toToolCommand(name),
    mutating: workflow.mutating,
    gated: workflow.gate,
    group: workflow.group,
    execute: async (input, context) =>
      executeWorkflow(
        name === "quickstart" ||
          name === "verify" ||
          name === "release-check" ||
          name === "doctor" ||
          name === "scaffold"
          ? {
              ...(isRecord(input) ? input : {}),
              workspaceRoot: context.workspaceRoot,
            }
          : input
      ),
  }
}

export const governedOperatorTools = OPERATOR_TOOL_NAMES.map((name) =>
  createGovernedToolDefinition(name)
) satisfies readonly GovernedOperatorToolDefinition[]

export function getGovernedOperatorTool(
  name: GovernedOperatorToolName
): GovernedOperatorToolDefinition | undefined {
  return governedOperatorTools.find((tool) => tool.name === name)
}
