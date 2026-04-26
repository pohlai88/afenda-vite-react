import { z } from "zod"
import {
  knowledgeEntityExtractRequestSchema,
  knowledgeIntelligenceKpisSchema,
  knowledgeRelationCreateSchema,
  knowledgeSemanticSearchRequestSchema,
  knowledgeWorkflowAlphaRequestSchema,
  knowledgeAttachmentIndexRequestSchema,
  knowledgeSharingRulesInputSchema,
  knowledgeCommentInputSchema,
  knowledgeDocumentIdSchema,
  knowledgeSearchQualityMetricsSchema,
  knowledgeSharingRuleSchema,
  knowledgeWorkspaceIdSchema,
} from "@afenda/knowledge-contracts"

export const knowledgeWorkspaceQuerySchema = z.object({
  workspaceId: z.string().trim().min(1),
})

export const knowledgeSearchRequestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  query: z.string().trim().min(1).max(240),
  limit: z.number().int().positive().max(50).default(20),
})

export const knowledgeDocumentScopedQuerySchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
})

export const knowledgeRelationsListQuerySchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  includeSuperseded: z.coerce.boolean().optional().default(false),
})

export const knowledgeCommentCreateSchema = knowledgeCommentInputSchema

export const knowledgeRevisionCreateSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  summary: z.string().trim().min(1).max(240),
})

export const knowledgeSharingRulesRequestSchema =
  knowledgeSharingRulesInputSchema
export const knowledgeSharingRuleRecordSchema = knowledgeSharingRuleSchema
export const knowledgeAttachmentIndexCreateSchema =
  knowledgeAttachmentIndexRequestSchema
export const knowledgeSearchQualityMetricsRecordSchema =
  knowledgeSearchQualityMetricsSchema

export const knowledgeSemanticSearchRequest =
  knowledgeSemanticSearchRequestSchema
export const knowledgeRelationCreateRequest = knowledgeRelationCreateSchema
export const knowledgeEntityExtractRequest = knowledgeEntityExtractRequestSchema
export const knowledgeWorkflowAlphaRequest = knowledgeWorkflowAlphaRequestSchema
export const knowledgeIntelligenceKpisRecordSchema =
  knowledgeIntelligenceKpisSchema
