import type {
  KnowledgeCaptureRecord,
  KnowledgeSearchQuery,
} from "@afenda/knowledge-contracts"

export type KnowledgeSearchResult = {
  readonly id: string
  readonly workspaceId: string
  readonly title: string
  readonly snippet: string
  readonly score: number
  readonly retrieval?: {
    readonly mode: "lexical" | "semantic" | "hybrid"
    readonly semanticScore?: number
    readonly lexicalScore?: number
  }
}

export function runLexicalKnowledgeSearch(
  documents: readonly KnowledgeCaptureRecord[],
  query: KnowledgeSearchQuery
): KnowledgeSearchResult[] {
  const normalizedQuery = query.query.toLocaleLowerCase()

  return documents
    .filter((doc) => doc.workspaceId === query.workspaceId)
    .map((doc) => {
      const haystack = `${doc.title}\n${doc.content}`.toLocaleLowerCase()
      const score = haystack.includes(normalizedQuery)
        ? normalizedQuery.length / Math.max(haystack.length, 1)
        : 0

      return {
        id: doc.id,
        workspaceId: doc.workspaceId,
        title: doc.title,
        snippet: doc.content.slice(0, 200),
        score,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, query.limit)
}
