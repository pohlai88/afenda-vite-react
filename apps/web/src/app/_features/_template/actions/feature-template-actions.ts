/**
 * Feature template command registry and execution helpers.
 *
 * Purpose:
 * - Define the canonical command catalog for feature templates.
 * - Execute commands through a stable, typed handler map.
 * - Preserve compile-time coverage between command IDs and implementations.
 *
 * Rules:
 * - Every command ID must have exactly one handler.
 * - Execution must always return a normalized FeatureTemplateCommandResult.
 * - Shared execution context is computed once per invocation.
 * - User-facing copy should remain predictable and avoid fragile formatting.
 */
import type {
  FeatureTemplateCommand,
  FeatureTemplateCommandId,
  FeatureTemplateCommandResult,
  FeatureTemplateDefinition,
} from "../types/feature-template"
import { getPrimaryFeatureTemplateRecord } from "../utils/feature-template-utils"

export const featureTemplateCommands = [
  {
    id: "refresh-view",
    label: "Refresh",
    description:
      "Reconcile the current workspace stream with the latest scope.",
  },
  {
    id: "open-primary-record",
    label: "Open priority record",
    description: "Navigate to the first record that needs operator context.",
  },
  {
    id: "review-queue",
    label: "Review queue",
    description: "Open the feature work queue for triage.",
  },
  {
    id: "export-audit-pack",
    label: "Export evidence",
    description: "Prepare the current feature records for reviewer handoff.",
  },
] as const satisfies readonly FeatureTemplateCommand[]

interface FeatureTemplateCommandContext {
  readonly feature: FeatureTemplateDefinition
  readonly primaryRecord: ReturnType<typeof getPrimaryFeatureTemplateRecord>
  readonly recordCount: number
}

type FeatureTemplateCommandHandler = (
  context: FeatureTemplateCommandContext
) => string

function formatRecordCount(count: number): string {
  return `${count} record${count === 1 ? "" : "s"}`
}

const featureTemplateCommandHandlers = {
  "refresh-view": ({ feature }) =>
    `${feature.title} refreshed for the active workspace scope.`,
  "open-primary-record": ({ feature, primaryRecord }) =>
    primaryRecord
      ? `Ready to open ${primaryRecord.id}: ${primaryRecord.title}.`
      : `No records are waiting in ${feature.title}.`,
  "review-queue": ({ feature, recordCount }) =>
    `${formatRecordCount(recordCount)} queued for ${feature.title}.`,
  "export-audit-pack": ({ feature, recordCount }) =>
    `Prepared ${formatRecordCount(recordCount)} from ${feature.title} for export.`,
} satisfies Record<FeatureTemplateCommandId, FeatureTemplateCommandHandler>

export function executeFeatureTemplateCommand(
  feature: FeatureTemplateDefinition,
  commandId: FeatureTemplateCommandId
): FeatureTemplateCommandResult {
  const context: FeatureTemplateCommandContext = {
    feature,
    primaryRecord: getPrimaryFeatureTemplateRecord(feature.records),
    recordCount: feature.records.length,
  }

  return {
    commandId,
    featureSlug: feature.slug,
    message: featureTemplateCommandHandlers[commandId](context),
  }
}
