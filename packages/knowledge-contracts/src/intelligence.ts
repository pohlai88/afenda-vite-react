import { z } from "zod"

import { knowledgeDocumentIdSchema, knowledgeWorkspaceIdSchema } from "./core"

/** Immutable knowledge artifact lifecycle (truth table append + supersession) */
export const knowledgeArtifactStatusSchema = z.enum(["active", "superseded"])

export const knowledgeChunkIndexRecordSchema = z.object({
  id: z.string().min(1),
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  chunkIndex: z.number().int().nonnegative(),
  text: z.string().min(1),
  /** L2-normalized embedding vector (provider-specific; v1 = deterministic in-repo) */
  embedding: z.array(z.number()),
  embeddingModel: z.string().min(1),
  indexedAt: z.coerce.date(),
  status: knowledgeArtifactStatusSchema.default("active"),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
})

export const knowledgeSemanticSearchRequestSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  query: z.string().trim().min(1).max(240),
  limit: z.number().int().positive().max(20).default(8),
  /** When true, list endpoints include superseded artifacts */
  includeSuperseded: z.boolean().default(false),
})

export const knowledgeCitationSchema = z.object({
  documentId: knowledgeDocumentIdSchema,
  snippet: z.string().trim().min(1),
})

export const knowledgeCitedAnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(knowledgeCitationSchema),
})

export const knowledgeRelationSchema = z.object({
  id: z.string().min(1),
  workspaceId: knowledgeWorkspaceIdSchema,
  fromDocumentId: knowledgeDocumentIdSchema,
  relationType: z.enum([
    "references",
    "depends_on",
    "duplicates",
    "related_to",
  ]),
  toDocumentId: knowledgeDocumentIdSchema,
  confidence: z.number().min(0).max(1).default(0.5),
  createdAt: z.coerce.date(),
  status: knowledgeArtifactStatusSchema.default("active"),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
})

export const knowledgeRelationCreateSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  fromDocumentId: knowledgeDocumentIdSchema,
  relationType: z.enum([
    "references",
    "depends_on",
    "duplicates",
    "related_to",
  ]),
  toDocumentId: knowledgeDocumentIdSchema,
  confidence: z.number().min(0).max(1).default(0.5),
  /** When set, marks the prior relation id as superseded (truth append) */
  supersedes: z.string().optional(),
})

export const knowledgeEntitySchema = z.object({
  id: z.string().min(1),
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  label: z.string().trim().min(1),
  entityType: z.enum([
    "person",
    "organization",
    "module",
    "domain_term",
    "other",
  ]),
  confidence: z.number().min(0).max(1).default(0.5),
  extractedAt: z.coerce.date(),
  status: knowledgeArtifactStatusSchema.default("active"),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
})

export const knowledgeEntityExtractRequestSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
})

export const knowledgeWorkflowAlphaRequestSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  plugin: z.enum(["summary", "action-items", "follow-up-checklist"]),
  /** Supersede a prior workflow result entity id (truth append) */
  supersedes: z.string().trim().min(1).optional(),
})

export const knowledgeWorkflowAlphaResultSchema = z.object({
  id: z.string().min(1),
  workspaceId: knowledgeWorkspaceIdSchema,
  plugin: z.string(),
  documentId: knowledgeDocumentIdSchema,
  output: z.record(z.string(), z.unknown()),
  generatedAt: z.coerce.date(),
  status: knowledgeArtifactStatusSchema.default("active"),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
})

export const knowledgeWorkflowPluginRolloutSchema = z.enum([
  "off",
  "alpha",
  "ga",
])

export const knowledgeWorkflowPluginRegistryEntrySchema = z.object({
  id: z.enum(["summary", "action-items", "follow-up-checklist"]),
  version: z.string().min(1),
  owner: z.string().min(1),
  enabled: z.boolean(),
  rollout: knowledgeWorkflowPluginRolloutSchema,
})

export const knowledgeIntelligenceKpisSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  semanticQueryCount: z.number().int().nonnegative(),
  answerQueryCount: z.number().int().nonnegative(),
  totalCitationCount: z.number().int().nonnegative(),
  relationCount: z.number().int().nonnegative(),
  entityExtractionCount: z.number().int().nonnegative(),
  workflowRunCount: z.number().int().nonnegative(),
  /** Chunks in the semantic index for the workspace (best-effort) */
  indexedChunkCount: z.number().int().nonnegative(),
  lastSemanticSearchLatencyMs: z.number().nonnegative().nullable(),
  /** Recent hybrid retrieval mix: semanticOnly / hybrid / lexicalFallback */
  lastRetrievalMode: z
    .enum(["semantic", "hybrid", "lexical_fallback"])
    .nullable(),
  lastActivityAt: z.coerce.date().nullable(),
})

export type KnowledgeSemanticSearchRequest = z.infer<
  typeof knowledgeSemanticSearchRequestSchema
>
export type KnowledgeCitedAnswer = z.infer<typeof knowledgeCitedAnswerSchema>
export type KnowledgeRelation = z.infer<typeof knowledgeRelationSchema>
export type KnowledgeRelationCreate = z.infer<
  typeof knowledgeRelationCreateSchema
>
export type KnowledgeEntity = z.infer<typeof knowledgeEntitySchema>
export type KnowledgeEntityExtractRequest = z.infer<
  typeof knowledgeEntityExtractRequestSchema
>
export type KnowledgeWorkflowAlphaRequest = z.infer<
  typeof knowledgeWorkflowAlphaRequestSchema
>
export type KnowledgeWorkflowAlphaResult = z.infer<
  typeof knowledgeWorkflowAlphaResultSchema
>
export type KnowledgeIntelligenceKpis = z.infer<
  typeof knowledgeIntelligenceKpisSchema
>
export type KnowledgeChunkIndexRecord = z.infer<
  typeof knowledgeChunkIndexRecordSchema
>
export type KnowledgeArtifactStatus = z.infer<
  typeof knowledgeArtifactStatusSchema
>
export type KnowledgeWorkflowPluginRegistryEntry = z.infer<
  typeof knowledgeWorkflowPluginRegistryEntrySchema
>
