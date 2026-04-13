import { featureTemplateCommands } from "../actions/feature-template-actions"
import { fetchFeatureTemplate } from "../services/feature-template-service"
import type { FeatureTemplateSlug } from "../types/feature-template"

export interface FeatureTemplateReport {
  readonly featureSlug: FeatureTemplateSlug
  readonly commandCount: number
  readonly metricCount: number
  readonly recordCount: number
  readonly hasPublicApi: boolean
  readonly requiredFolders: readonly string[]
}

export const featureTemplateRequiredFolders = [
  "__tests__",
  "actions",
  "components",
  "db-schema",
  "hooks",
  "scripts",
  "services",
  "types",
  "utils",
] as const

export async function createFeatureTemplateReport(
  featureSlug: FeatureTemplateSlug
): Promise<FeatureTemplateReport> {
  const feature = await fetchFeatureTemplate(featureSlug)

  return {
    featureSlug,
    commandCount: featureTemplateCommands.length,
    metricCount: feature.metrics.length,
    recordCount: feature.records.length,
    hasPublicApi: true,
    requiredFolders: featureTemplateRequiredFolders,
  }
}
