/**
 * Feature template reporting contract and summary builder.
 *
 * Purpose:
 * - Produce a stable summary for a feature template instance.
 * - Separate declared template policy from observed report evidence.
 * - Preserve explicit verification state for conformance fields.
 *
 * Rules:
 * - Policy expectations and observed findings must not be conflated.
 * - Unknown or unverified conditions must remain explicit in the report.
 * - Counts derived from fetched feature data must stay deterministic.
 * - The report shape should be ready for future structure validation.
 */
import { featureTemplateCommands } from "../actions/feature-template-actions"
import { fetchFeatureTemplate } from "../services/feature-template-service"
import type { FeatureTemplateSlug } from "../types/feature-template"

export interface VerificationField<T> {
  readonly value: T | null
  readonly status: "verified" | "unverified"
}

export interface FeatureTemplateStructurePolicy {
  readonly expectedFolders: readonly string[]
}

export interface FeatureTemplateStructureEvidence {
  readonly detectedFolders: VerificationField<readonly string[]>
  readonly missingFolders: VerificationField<readonly string[]>
  readonly hasPublicApi: VerificationField<boolean>
}

export interface FeatureTemplateReport {
  readonly featureSlug: FeatureTemplateSlug
  readonly commandCount: number
  readonly metricCount: number
  readonly recordCount: number
  readonly structurePolicy: FeatureTemplateStructurePolicy
  readonly structureEvidence: FeatureTemplateStructureEvidence
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

function createFeatureTemplateStructurePolicy(): FeatureTemplateStructurePolicy {
  return {
    expectedFolders: featureTemplateRequiredFolders,
  }
}

function createUnverifiedField<T>(): VerificationField<T> {
  return {
    value: null,
    status: "unverified",
  }
}

function createUnverifiedStructureEvidence(): FeatureTemplateStructureEvidence {
  return {
    detectedFolders: createUnverifiedField<readonly string[]>(),
    missingFolders: createUnverifiedField<readonly string[]>(),
    hasPublicApi: createUnverifiedField<boolean>(),
  }
}

export async function createFeatureTemplateReport(
  featureSlug: FeatureTemplateSlug
): Promise<FeatureTemplateReport> {
  const feature = await fetchFeatureTemplate(featureSlug)

  return {
    featureSlug,
    commandCount: featureTemplateCommands.length,
    metricCount: feature.metrics.length,
    recordCount: feature.records.length,
    structurePolicy: createFeatureTemplateStructurePolicy(),
    structureEvidence: createUnverifiedStructureEvidence(),
  }
}
