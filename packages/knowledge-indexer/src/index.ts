export type { KnowledgeChunk } from "./chunks"
export { chunkKnowledgeRecord } from "./chunks"
export {
  cosineSimilarity,
  deterministicEmbedding,
  KNOWLEDGE_EMBEDDING_MODEL_V1,
  DEFAULT_EMBEDDING_DIMENSIONS,
  l2Normalize,
} from "./embedding"
export {
  embedKnowledgeChunks,
  rankChunksBySemanticSimilarity,
  type EmbeddedKnowledgeChunk,
  type ScoredChunk,
} from "./semantic-rank"
