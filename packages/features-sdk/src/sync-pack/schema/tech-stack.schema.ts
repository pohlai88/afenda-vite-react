import { z } from "zod"

import {
  featureCategories,
  featureCategorySchema,
  type FeatureCategory,
} from "./category.schema.js"

export const techStackSectionSchema = z.array(z.string().min(1)).min(1)

export const techStackMatrixSchema = z.strictObject({
  defaultStack: z.record(z.string(), techStackSectionSchema),
  categoryOverrides: z.record(featureCategorySchema, techStackSectionSchema),
})

export const techStackRecommendationSchema = z.strictObject({
  category: featureCategorySchema,
  defaultStack: z.record(z.string(), techStackSectionSchema),
  categoryOverride: techStackSectionSchema,
})

export type TechStackMatrix = z.infer<typeof techStackMatrixSchema>
export type TechStackRecommendation = z.infer<
  typeof techStackRecommendationSchema
>

export const defaultTechStack = {
  frontend: [
    "React + Vite + TypeScript",
    "shadcn/ui + Radix UI",
    "Tailwind CSS",
    "TanStack Query",
    "React Router",
  ],
  backend: [
    "Node.js + TypeScript",
    "Hono as the default API framework",
    "Drizzle ORM",
    "Postgres",
    "Zod validation",
  ],
  authSecurity: [
    "Tenant-aware auth",
    "RBAC / permission contracts",
    "RLS where needed",
    "Audit log by default",
  ],
  aiMl: [
    "OpenAI-compatible provider layer",
    "RAG-ready document interface",
    "Vector DB optional, not default",
  ],
  dataAnalytics: [
    "Postgres first",
    "DuckDB / ClickHouse only when scale requires",
    "CSV/XLSX import-export utilities",
    "BI/reporting surface later",
  ],
  infra: [
    "Docker-ready package boundaries",
    "pnpm workspace",
    "Turborepo",
    "GitHub Actions",
    "OpenTelemetry-ready logging",
  ],
} as const satisfies Record<string, readonly string[]>

export const categoryTechStackOverrides = {
  "communication-ai-ml": [
    "Provider abstraction",
    "Prompt/version tracking",
    "Document ingestion contract",
    "Eval notes",
  ],
  "business-saas": [
    "Tenant-aware workflow",
    "Approvals",
    "Audit records",
    "Role/permission matrix",
  ],
  "content-publishing": [
    "Workflow states",
    "Revisions",
    "Asset references",
    "Preview/publish contract",
  ],
  "data-analytics": [
    "Ingestion model",
    "Metric definitions",
    "Export formats",
    "Lineage notes",
  ],
  "infrastructure-operations": [
    "Health checks",
    "Event logs",
    "Operational runbook",
    "Incident states",
  ],
  "productivity-utilities": [
    "User preferences",
    "Import/export",
    "Task/state persistence",
  ],
  "security-privacy": [
    "Threat model",
    "Access review",
    "Audit retention",
    "Data classification",
  ],
  "mini-developer": [
    "Sandbox boundaries",
    "Generated artifact policy",
    "Approval gate",
    "Rollback plan",
  ],
} as const satisfies Record<FeatureCategory, readonly string[]>

export const techStackMatrix = techStackMatrixSchema.parse({
  defaultStack: defaultTechStack,
  categoryOverrides: categoryTechStackOverrides,
})

export function getTechStackForCategory(
  category: FeatureCategory
): TechStackRecommendation {
  return techStackRecommendationSchema.parse({
    category,
    defaultStack: techStackMatrix.defaultStack,
    categoryOverride: techStackMatrix.categoryOverrides[category],
  })
}

export function getAllTechStackRecommendations(): TechStackRecommendation[] {
  return featureCategories.map((category) => getTechStackForCategory(category))
}
