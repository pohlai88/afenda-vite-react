import { z } from "zod"

export const featureLanes = ["operate", "intelligence", "platform"] as const

export const featureCategories = [
  "communication-ai-ml",
  "business-saas",
  "content-publishing",
  "data-analytics",
  "infrastructure-operations",
  "productivity-utilities",
  "security-privacy",
  "mini-developer",
] as const

export const featureLaneSchema = z.enum(featureLanes)
export const featureCategorySchema = z.enum(featureCategories)

export type FeatureLane = (typeof featureLanes)[number]
export type FeatureCategory = (typeof featureCategories)[number]

export const categoryLaneMap = {
  "business-saas": "operate",
  "content-publishing": "operate",
  "productivity-utilities": "operate",
  "communication-ai-ml": "intelligence",
  "data-analytics": "intelligence",
  "infrastructure-operations": "platform",
  "mini-developer": "platform",
  "security-privacy": "platform",
} as const satisfies Record<FeatureCategory, FeatureLane>

export function getFeatureLane(category: FeatureCategory): FeatureLane {
  return categoryLaneMap[category]
}
