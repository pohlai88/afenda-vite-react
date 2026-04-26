import { z } from "zod"

import { knowledgeDocumentIdSchema, knowledgeWorkspaceIdSchema } from "./core"

export const knowledgeCommentIdSchema = z.string().trim().min(1)
export const knowledgeRevisionIdSchema = z.string().trim().min(1)

export const knowledgeCommentInputSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  body: z.string().trim().min(1).max(2000),
  mentions: z.array(z.string().trim().min(1)).default([]),
})

export const knowledgeCommentSchema = z.object({
  id: knowledgeCommentIdSchema,
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  body: z.string(),
  mentions: z.array(z.string()),
  createdBy: z.string().trim().min(1),
  createdAt: z.coerce.date(),
})

export const knowledgeRevisionSchema = z.object({
  id: knowledgeRevisionIdSchema,
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  summary: z.string().trim().min(1).max(240),
  createdBy: z.string().trim().min(1),
  createdAt: z.coerce.date(),
})

export const knowledgeActivityEventSchema = z.object({
  workspaceId: knowledgeWorkspaceIdSchema,
  documentId: knowledgeDocumentIdSchema,
  eventType: z.enum([
    "captured",
    "commented",
    "mentioned",
    "revised",
    "shared",
  ]),
  actorId: z.string().trim().min(1),
  timestamp: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type KnowledgeCommentInput = z.infer<typeof knowledgeCommentInputSchema>
export type KnowledgeComment = z.infer<typeof knowledgeCommentSchema>
export type KnowledgeRevision = z.infer<typeof knowledgeRevisionSchema>
export type KnowledgeActivityEvent = z.infer<
  typeof knowledgeActivityEventSchema
>
