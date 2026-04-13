import {
  featureTemplateSlugs,
  type FeatureTemplateRecord,
  type FeatureTemplateSlug,
  type FeatureTemplateStatus,
} from "../types/feature-template"

const slugSet = new Set<string>(featureTemplateSlugs)

export function isFeatureTemplateSlug(
  value: string
): value is FeatureTemplateSlug {
  return slugSet.has(value)
}

export function resolveFeatureTemplateSlug(
  value: string | undefined
): FeatureTemplateSlug {
  if (value && isFeatureTemplateSlug(value)) {
    return value
  }

  return "events"
}

export function formatFeatureTemplateStatus(
  status: FeatureTemplateStatus
): string {
  switch (status) {
    case "healthy":
      return "Healthy"
    case "attention":
      return "Needs attention"
    case "blocked":
      return "Blocked"
  }
}

export function getFeatureTemplateStatusClassName(
  status: FeatureTemplateStatus
): string {
  switch (status) {
    case "healthy":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "attention":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "blocked":
      return "border-destructive/40 bg-destructive/10 text-destructive"
  }
}

export function getPrimaryFeatureTemplateRecord(
  records: readonly FeatureTemplateRecord[]
): FeatureTemplateRecord | null {
  return records[0] ?? null
}
