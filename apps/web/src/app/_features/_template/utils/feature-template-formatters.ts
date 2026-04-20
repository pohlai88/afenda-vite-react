import type { FeatureTemplateRecord } from "../types/feature-template"

const FEATURE_TEMPLATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
})

const FEATURE_TEMPLATE_DATE_TIME_FORMATTER = new Intl.DateTimeFormat(
  undefined,
  {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
)

export function normalizeFeatureTemplateText(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function parseFeatureTemplateDate(updatedAt: string): Date | null {
  const parsedDate = new Date(updatedAt)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function resolveFeatureTemplateDateTime(
  updatedAt: string
): string | undefined {
  return parseFeatureTemplateDate(updatedAt)?.toISOString()
}

export function formatFeatureTemplateTime(
  updatedAt: string,
  eventTimeLabel?: string
): string {
  const explicitLabel = normalizeFeatureTemplateText(eventTimeLabel)
  if (explicitLabel) {
    return explicitLabel
  }

  const parsedDate = parseFeatureTemplateDate(updatedAt)
  if (!parsedDate) {
    return "Unknown time"
  }

  return FEATURE_TEMPLATE_TIME_FORMATTER.format(parsedDate)
}

export function formatFeatureTemplateDateTime(
  updatedAt: string,
  eventTimeLabel?: string
): string {
  const explicitLabel = normalizeFeatureTemplateText(eventTimeLabel)
  if (explicitLabel) {
    return explicitLabel
  }

  const parsedDate = parseFeatureTemplateDate(updatedAt)
  if (!parsedDate) {
    return "Unknown time"
  }

  return FEATURE_TEMPLATE_DATE_TIME_FORMATTER.format(parsedDate)
}

export function formatFeatureTemplateLastSync(
  records: readonly FeatureTemplateRecord[]
): string {
  const latestRecord = records[0]
  if (!latestRecord) {
    return "No records observed"
  }

  return `Last sync ${formatFeatureTemplateDateTime(latestRecord.updatedAt)}`
}
