import type {
  FeatureTemplateCommand,
  FeatureTemplateCommandId,
  FeatureTemplateCommandResult,
  FeatureTemplateDefinition,
} from "../types/feature-template"
import { getPrimaryFeatureTemplateRecord } from "../utils/feature-template-utils"

export const featureTemplateCommands = [
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

export function executeFeatureTemplateCommand(
  feature: FeatureTemplateDefinition,
  commandId: FeatureTemplateCommandId
): FeatureTemplateCommandResult {
  const primaryRecord = getPrimaryFeatureTemplateRecord(feature.records)

  switch (commandId) {
    case "open-primary-record":
      return {
        commandId,
        featureSlug: feature.slug,
        message: primaryRecord
          ? `Ready to open ${primaryRecord.id}: ${primaryRecord.title}.`
          : `No records are waiting in ${feature.title}.`,
      }
    case "review-queue":
      return {
        commandId,
        featureSlug: feature.slug,
        message: `${feature.records.length} record(s) queued for ${feature.title}.`,
      }
    case "export-audit-pack":
      return {
        commandId,
        featureSlug: feature.slug,
        message: `Prepared ${feature.records.length} ${feature.title.toLowerCase()} record(s) for export.`,
      }
  }
}
