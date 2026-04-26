import { z } from "zod"

export const knowledgeDocumentIdSchema = z.string().trim().min(1)
export const knowledgeWorkspaceIdSchema = z.string().trim().min(1)
