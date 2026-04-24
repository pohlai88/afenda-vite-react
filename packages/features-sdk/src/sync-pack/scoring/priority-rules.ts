import type { AppPriority } from "../schema/priority.schema.js"

export const criticalPrioritySignals = [
  "access",
  "audit",
  "backup",
  "compliance",
  "crm",
  "disaster recovery",
  "document management",
  "iam",
  "identity",
  "monitoring",
  "privacy",
  "recovery",
  "reporting",
  "secrets",
  "security",
  "sso",
  "support",
  "uptime",
] as const

export const essentialPrioritySignals = [
  "ai assistant",
  "analytics",
  "automation",
  "data integration",
  "forms",
  "knowledge base",
  "localization",
  "metrics",
  "product analytics",
  "project management",
  "survey",
  "translation",
  "workflow",
] as const

export const priorityScoreThresholds = {
  critical: 8,
  essential: 3,
} as const satisfies Record<Exclude<AppPriority, "good-to-have">, number>

export const priorityScoreWeights = {
  criticalSignal: 4,
  essentialSignal: 2,
  highSensitivity: 3,
  mediumSensitivity: 1,
  securityReviewRequired: 1,
  licenseReviewRequired: 1,
} as const
