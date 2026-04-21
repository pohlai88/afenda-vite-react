import {
  featureTemplateSlugs,
  type FeatureTemplateRecord,
  type FeatureTemplateSlug,
  type FeatureTemplateStatus,
  type FeatureTemplateTone,
} from "./types/feature-template"

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
      return "border-success/40 bg-success/10 text-success"
    case "attention":
      return "border-warning/40 bg-warning/10 text-warning"
    case "blocked":
      return "border-destructive/40 bg-destructive/10 text-destructive"
  }
}

export function getFeatureTemplateToneClassName(
  tone: FeatureTemplateTone = "neutral"
): string {
  switch (tone) {
    case "success":
      return "border-success/35 bg-success/10 text-success"
    case "warning":
      return "border-warning/35 bg-warning/10 text-warning"
    case "danger":
      return "border-destructive/35 bg-destructive/10 text-destructive"
    case "info":
      return "border-info/35 bg-info/10 text-info"
    case "neutral":
      return "border-border-muted bg-muted/45 text-muted-foreground"
  }
}

export function formatFeatureTemplateSeverity(
  severity: FeatureTemplateRecord["severity"]
): string {
  switch (severity) {
    case "high":
      return "High"
    case "medium":
      return "Medium"
    case "low":
      return "Low"
    default:
      return "Normal"
  }
}

export function getFeatureTemplateSeverityClassName(
  severity: FeatureTemplateRecord["severity"]
): string {
  switch (severity) {
    case "high":
      return "border-destructive/35 bg-destructive/10 text-destructive"
    case "medium":
      return "border-warning/35 bg-warning/10 text-warning"
    case "low":
      return "border-success/35 bg-success/10 text-success"
    default:
      return "border-border-muted bg-muted/45 text-muted-foreground"
  }
}

export function getPrimaryFeatureTemplateRecord(
  records: readonly FeatureTemplateRecord[]
): FeatureTemplateRecord | null {
  return records[0] ?? null
}
