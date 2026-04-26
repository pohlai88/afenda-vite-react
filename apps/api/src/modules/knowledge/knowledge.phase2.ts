/**
 * Phase 2 preparation contract for collaboration/reliability surfaces.
 * This file intentionally defines scope constants only; endpoints are added in Phase 2.
 */
export const knowledgePhase2Scope = {
  collaboration: ["comments", "mentions", "revision-history"] as const,
  reliability: [
    "activity-stream",
    "sharing-rules",
    "attachment-indexing",
  ] as const,
  quality: ["search-quality-metrics"] as const,
}

export type KnowledgePhase2Scope = typeof knowledgePhase2Scope
