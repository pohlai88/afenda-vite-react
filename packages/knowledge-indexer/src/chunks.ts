import type { KnowledgeCaptureRecord } from "@afenda/knowledge-contracts"

export type KnowledgeChunk = {
  readonly documentId: string
  readonly workspaceId: string
  readonly chunkIndex: number
  readonly text: string
}

export function chunkKnowledgeRecord(
  record: KnowledgeCaptureRecord,
  chunkSize = 400
): KnowledgeChunk[] {
  const tokens = record.content.split(/\s+/u)
  const chunks: KnowledgeChunk[] = []

  let offset = 0
  let index = 0
  while (offset < tokens.length) {
    const slice = tokens.slice(offset, offset + chunkSize)
    if (slice.length === 0) {
      break
    }

    chunks.push({
      documentId: record.id,
      workspaceId: record.workspaceId,
      chunkIndex: index,
      text: slice.join(" "),
    })

    offset += chunkSize
    index += 1
  }

  return chunks
}
