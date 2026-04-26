import type { KnowledgeCaptureRecord } from "@afenda/knowledge-contracts"
import type { KnowledgeSearchResult } from "@afenda/knowledge-search"
import {
  deterministicEmbedding,
  embedKnowledgeChunks,
  rankChunksBySemanticSimilarity,
  type KnowledgeChunk,
} from "@afenda/knowledge-indexer"
import { runLexicalKnowledgeSearch } from "@afenda/knowledge-search"

function normalizeLexicalScore(raw: number): number {
  return Math.min(1, Math.max(0, raw * 400))
}

/**
 * Hybrid semantic (cosine on indexed chunks) + lexical gate. Falls back to lexical-only when no chunks.
 */
export function runHybridSemanticKnowledgeSearch(input: {
  documents: readonly KnowledgeCaptureRecord[]
  chunks: readonly KnowledgeChunk[]
  workspaceId: string
  query: string
  limit: number
}): {
  results: KnowledgeSearchResult[]
  mode: "semantic" | "hybrid" | "lexical_fallback"
} {
  const qLower = input.query.toLowerCase()
  const lexicalWide = runLexicalKnowledgeSearch(input.documents, {
    workspaceId: input.workspaceId,
    query: input.query,
    limit: 50,
  })
  const lexicalByDoc = new Map(lexicalWide.map((row) => [row.id, row] as const))

  if (input.chunks.length === 0) {
    const lexOnly = runLexicalKnowledgeSearch(input.documents, {
      workspaceId: input.workspaceId,
      query: input.query,
      limit: input.limit,
    })
    return {
      results: lexOnly.map((row) => ({
        ...row,
        retrieval: {
          mode: "lexical" as const,
          lexicalScore: normalizeLexicalScore(row.score),
        },
      })),
      mode: "lexical_fallback",
    }
  }

  const queryEmbedding = deterministicEmbedding(input.query)
  const embedded = embedKnowledgeChunks(input.chunks)
  const ranked = rankChunksBySemanticSimilarity(queryEmbedding, embedded)

  const bestChunkByDoc = new Map<
    string,
    { text: string; semanticScore: number }
  >()
  for (const row of ranked) {
    const prev = bestChunkByDoc.get(row.documentId)
    if (!prev || row.semanticScore > prev.semanticScore) {
      bestChunkByDoc.set(row.documentId, {
        text: row.text,
        semanticScore: row.semanticScore,
      })
    }
  }

  const docById = new Map(input.documents.map((d) => [d.id, d] as const))
  const candidates = new Set<string>([
    ...bestChunkByDoc.keys(),
    ...lexicalWide.map((l) => l.id),
  ])

  const merged: KnowledgeSearchResult[] = []
  for (const documentId of candidates) {
    const doc = docById.get(documentId)
    if (!doc) {
      continue
    }
    const sem = bestChunkByDoc.get(documentId)
    const lex = lexicalByDoc.get(documentId)
    const lexN = lex ? normalizeLexicalScore(lex.score) : 0
    const semScore = sem?.semanticScore ?? 0
    const titleMatch = doc.title.toLowerCase().includes(qLower) ? 0.08 : 0
    const combined =
      semScore > 0
        ? Math.min(1, 0.62 * semScore + 0.35 * lexN + titleMatch)
        : Math.min(1, 0.55 * lexN + titleMatch)

    if (combined <= 0 && !sem && !lex) {
      continue
    }

    const snippetSource = sem?.text ?? lex?.snippet ?? doc.content
    merged.push({
      id: doc.id,
      workspaceId: doc.workspaceId,
      title: doc.title,
      snippet: snippetSource.slice(0, 200),
      score: combined,
      retrieval: {
        mode:
          semScore > 0 && lexN > 0.02
            ? "hybrid"
            : semScore > 0
              ? "semantic"
              : "lexical",
        semanticScore: semScore > 0 ? semScore : undefined,
        lexicalScore: lexN > 0 ? lexN : undefined,
      },
    })
  }

  merged.sort((left, right) => right.score - left.score)
  const top = merged.slice(0, input.limit)
  const mode = top.some((r) => r.retrieval?.mode === "hybrid")
    ? "hybrid"
    : "semantic"

  return {
    results: top,
    mode: top.length === 0 ? "lexical_fallback" : mode,
  }
}
