import type { KnowledgeChunk } from "./chunks"
import {
  cosineSimilarity,
  deterministicEmbedding,
  KNOWLEDGE_EMBEDDING_MODEL_V1,
} from "./embedding"

export type EmbeddedKnowledgeChunk = KnowledgeChunk & {
  readonly embedding: readonly number[]
  readonly embeddingModel: string
}

export function embedKnowledgeChunks(
  chunks: readonly KnowledgeChunk[],
  embedText: (text: string) => readonly number[] = (t) =>
    deterministicEmbedding(t)
): EmbeddedKnowledgeChunk[] {
  return chunks.map((c) => ({
    ...c,
    embedding: embedText(c.text),
    embeddingModel: KNOWLEDGE_EMBEDDING_MODEL_V1,
  }))
}

export type ScoredChunk = EmbeddedKnowledgeChunk & {
  readonly semanticScore: number
}

/**
 * Rank chunks by cosine similarity; returns best-first.
 */
export function rankChunksBySemanticSimilarity(
  queryEmbedding: readonly number[],
  chunks: readonly EmbeddedKnowledgeChunk[]
): ScoredChunk[] {
  return chunks
    .map((c) => ({
      ...c,
      semanticScore: cosineSimilarity(queryEmbedding, c.embedding),
    }))
    .filter((c) => c.semanticScore > 0)
    .sort((a, b) => b.semanticScore - a.semanticScore)
}
