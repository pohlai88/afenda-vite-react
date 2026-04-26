import {
  type KnowledgeCaptureInput,
  type KnowledgeCaptureRecord,
  knowledgeCaptureInputSchema,
} from "@afenda/knowledge-contracts"

export function createKnowledgeCaptureRecord(
  input: KnowledgeCaptureInput,
  now: Date,
  idFactory: () => string
): KnowledgeCaptureRecord {
  const normalized = knowledgeCaptureInputSchema.parse(input)

  return {
    id: idFactory(),
    workspaceId: normalized.workspaceId,
    title: normalized.title,
    content: normalized.content,
    tags: normalized.tags,
    parentDocumentId: normalized.parentDocumentId ?? null,
    backlinks: normalized.backlinks,
    source: normalized.source,
    createdAt: now,
    updatedAt: now,
  }
}
