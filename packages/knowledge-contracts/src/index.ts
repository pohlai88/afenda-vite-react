import { z } from "zod"

export { knowledgeDocumentIdSchema, knowledgeWorkspaceIdSchema } from "./core"
import { knowledgeDocumentIdSchema, knowledgeWorkspaceIdSchema } from "./core"

export const knowledgeCaptureInputSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  parentDocumentId: knowledgeDocumentIdSchema.optional(),
  backlinks: z.array(knowledgeDocumentIdSchema).default([]),
  source: z.enum(["inbox", "editor", "api"]).default("editor"),
})

export const knowledgeCaptureRecordSchema = z.object({
  id: knowledgeDocumentIdSchema,
  workspaceId: knowledgeWorkspaceIdSchema,
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  parentDocumentId: knowledgeDocumentIdSchema.nullable(),
  backlinks: z.array(knowledgeDocumentIdSchema),
  source: z.enum(["inbox", "editor", "api"]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const knowledgeSearchQuerySchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  query: z.string().trim().min(1).max(240),
  limit: z.number().int().positive().max(50).default(20),
})

export type KnowledgeCaptureInput = z.infer<typeof knowledgeCaptureInputSchema>
export type KnowledgeCaptureRecord = z.infer<
  typeof knowledgeCaptureRecordSchema
>
export type KnowledgeSearchQuery = z.infer<typeof knowledgeSearchQuerySchema>

export {
  knowledgeActivityEventSchema,
  knowledgeCommentIdSchema,
  knowledgeCommentInputSchema,
  knowledgeCommentSchema,
  knowledgeRevisionIdSchema,
  knowledgeRevisionSchema,
  type KnowledgeActivityEvent,
  type KnowledgeComment,
  type KnowledgeCommentInput,
  type KnowledgeRevision,
} from "./collaboration"

export {
  attachmentIndexStatusSchema,
  knowledgeAttachmentIndexRecordSchema,
  knowledgeAttachmentIndexRequestSchema,
  knowledgeSearchQualityMetricsSchema,
  knowledgeSharingRuleSchema,
  knowledgeSharingRulesInputSchema,
  type KnowledgeAttachmentIndexRecord,
  type KnowledgeAttachmentIndexRequest,
  type KnowledgeSearchQualityMetrics,
  type KnowledgeSharingRule,
  type KnowledgeSharingRulesInput,
} from "./reliability"

export {
  knowledgeArtifactStatusSchema,
  knowledgeChunkIndexRecordSchema,
  knowledgeCitedAnswerSchema,
  knowledgeEntityExtractRequestSchema,
  knowledgeEntitySchema,
  knowledgeIntelligenceKpisSchema,
  knowledgeRelationCreateSchema,
  knowledgeRelationSchema,
  knowledgeSemanticSearchRequestSchema,
  knowledgeWorkflowAlphaRequestSchema,
  knowledgeWorkflowAlphaResultSchema,
  knowledgeWorkflowPluginRegistryEntrySchema,
  type KnowledgeArtifactStatus,
  type KnowledgeChunkIndexRecord,
  type KnowledgeCitedAnswer,
  type KnowledgeEntity,
  type KnowledgeIntelligenceKpis,
  type KnowledgeEntityExtractRequest,
  type KnowledgeRelation,
  type KnowledgeRelationCreate,
  type KnowledgeSemanticSearchRequest,
  type KnowledgeWorkflowAlphaRequest,
  type KnowledgeWorkflowAlphaResult,
  type KnowledgeWorkflowPluginRegistryEntry,
} from "./intelligence"
