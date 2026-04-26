import { z } from "zod"

import { knowledgeDocumentIdSchema, knowledgeWorkspaceIdSchema } from "./core"

export const knowledgeSharingRuleSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  role: z.enum(["owner", "editor", "viewer"]),
  principalId: z.string().trim().min(1),
  canComment: z.boolean().default(true),
  canShare: z.boolean().default(false),
})

export const knowledgeSharingRulesInputSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  rules: z.array(knowledgeSharingRuleSchema).default([]),
})

export const attachmentIndexStatusSchema = z.enum([
  "queued",
  "indexed",
  "failed",
])

export const knowledgeAttachmentIndexRecordSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  attachmentName: z.string().trim().min(1),
  status: attachmentIndexStatusSchema,
  createdAt: z.coerce.date(),
})

export const knowledgeAttachmentIndexRequestSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  attachmentName: z.string().trim().min(1),
})

export const knowledgeSearchQualityMetricsSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  queryCount: z.number().int().nonnegative(),
  zeroResultCount: z.number().int().nonnegative(),
  totalResults: z.number().int().nonnegative(),
  avgLatencyMs: z.number().nonnegative(),
  lastQueryAt: z.coerce.date().nullable(),
})

export type KnowledgeSharingRule = z.infer<typeof knowledgeSharingRuleSchema>
export type KnowledgeSharingRulesInput = z.infer<
  typeof knowledgeSharingRulesInputSchema
>
export type KnowledgeAttachmentIndexRecord = z.infer<
  typeof knowledgeAttachmentIndexRecordSchema
>
export type KnowledgeAttachmentIndexRequest = z.infer<
  typeof knowledgeAttachmentIndexRequestSchema
>
export type KnowledgeSearchQualityMetrics = z.infer<
  typeof knowledgeSearchQualityMetricsSchema
>
