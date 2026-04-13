export const featureTemplateStatuses = [
  "healthy",
  "attention",
  "blocked",
] as const

export type FeatureTemplateStatus = (typeof featureTemplateStatuses)[number]

export const featureTemplateSlugs = ["events", "audit", "partners"] as const

export type FeatureTemplateSlug = (typeof featureTemplateSlugs)[number]

export interface FeatureTemplateMetric {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly helper: string
}

export interface FeatureTemplateRecord {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly status: FeatureTemplateStatus
  readonly owner: string
  readonly updatedAt: string
}

export interface FeatureTemplateDefinition {
  readonly slug: FeatureTemplateSlug
  readonly title: string
  readonly description: string
  readonly status: FeatureTemplateStatus
  readonly routePath: string
  readonly metrics: readonly FeatureTemplateMetric[]
  readonly records: readonly FeatureTemplateRecord[]
}

export type FeatureTemplateCommandId =
  | "open-primary-record"
  | "review-queue"
  | "export-audit-pack"

export interface FeatureTemplateCommand {
  readonly id: FeatureTemplateCommandId
  readonly label: string
  readonly description: string
}

export interface FeatureTemplateCommandResult {
  readonly commandId: FeatureTemplateCommandId
  readonly featureSlug: FeatureTemplateSlug
  readonly message: string
}
