import {
  syncPackWorkflowCatalog,
  type SyncPackWorkflowName,
} from "@afenda/features-sdk/sync-pack"

import {
  CLINE_TOOL_NAMES,
  type GovernedClineToolName,
} from "../../../runtime/contracts.js"
import type { GovernedClineToolDefinition } from "../mode/cline-mode-contract.js"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toToolCommand(name: GovernedClineToolName): string {
  return name === "quickstart"
    ? "pnpm run feature-sync"
    : `pnpm run feature-sync:${name}`
}

function createGovernedToolDefinition(
  name: GovernedClineToolName
): GovernedClineToolDefinition {
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

export const governedClineTools = CLINE_TOOL_NAMES.map((name) =>
  createGovernedToolDefinition(name)
) satisfies readonly GovernedClineToolDefinition[]

export function getGovernedClineTool(
  name: GovernedClineToolName
): GovernedClineToolDefinition | undefined {
  return governedClineTools.find((tool) => tool.name === name)
}
