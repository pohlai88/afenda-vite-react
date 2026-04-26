import { apiClient } from "../../../rpc/web-client"
import type { WebSuccessEnvelope } from "../../../rpc/web-envelope.contract"
import type {
  KnowledgeCitedAnswer,
  KnowledgeActivityEvent,
  KnowledgeCaptureRecord,
  KnowledgeComment,
  KnowledgeCommentInput,
  KnowledgeEntity,
  KnowledgeIntelligenceKpis,
  KnowledgeRelation,
  KnowledgeRevision,
} from "@afenda/knowledge-contracts"
import type { KnowledgeSearchResult } from "@afenda/knowledge-search"

export type KnowledgeCaptureRequest = {
  readonly workspaceId: string
  readonly title: string
  readonly content: string
  readonly tags?: readonly string[]
  readonly parentDocumentId?: string
  readonly backlinks?: readonly string[]
  readonly source?: "inbox" | "editor" | "api"
}

export async function captureKnowledge(input: KnowledgeCaptureRequest) {
  const response = await apiClient.api.v1.knowledge.capture.$post({
    json: {
      workspaceId: input.workspaceId,
      title: input.title,
      content: input.content,
      tags: input.tags ? [...input.tags] : [],
      parentDocumentId: input.parentDocumentId,
      backlinks: input.backlinks ? [...input.backlinks] : [],
      source: input.source ?? "editor",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to capture knowledge document.")
  }

  return (await response.json()) as WebSuccessEnvelope<KnowledgeCaptureRecord>
}

export async function searchKnowledge(input: {
  readonly workspaceId: string
  readonly query: string
  readonly limit?: number
}) {
  const response = await apiClient.api.v1.knowledge.search.$post({
    json: {
      workspaceId: input.workspaceId,
      query: input.query,
      limit: input.limit ?? 20,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to search knowledge documents.")
  }

  return (await response.json()) as WebSuccessEnvelope<KnowledgeSearchResult[]>
}

export async function listKnowledgeComments(input: {
  readonly workspaceId: string
  readonly documentId: string
}) {
  const response = await apiClient.api.v1.knowledge.comments.$get({
    query: {
      workspaceId: input.workspaceId,
      documentId: input.documentId,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to list knowledge comments.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeComment[]>
}

export async function addKnowledgeComment(input: KnowledgeCommentInput) {
  const response = await apiClient.api.v1.knowledge.comments.$post({
    json: {
      workspaceId: input.workspaceId,
      documentId: input.documentId,
      body: input.body,
      mentions: [...input.mentions],
    },
  })
  if (!response.ok) {
    throw new Error("Failed to add knowledge comment.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeComment>
}

export async function listKnowledgeRevisions(input: {
  readonly workspaceId: string
  readonly documentId: string
}) {
  const response = await apiClient.api.v1.knowledge.revisions.$get({
    query: {
      workspaceId: input.workspaceId,
      documentId: input.documentId,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to list knowledge revisions.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeRevision[]>
}

export async function addKnowledgeRevision(input: {
  readonly workspaceId: string
  readonly documentId: string
  readonly summary: string
}) {
  const response = await apiClient.api.v1.knowledge.revisions.$post({
    json: {
      workspaceId: input.workspaceId,
      documentId: input.documentId,
      summary: input.summary,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to add knowledge revision.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeRevision>
}

export async function listKnowledgeActivity(input: {
  readonly workspaceId: string
  readonly documentId: string
}) {
  const response = await apiClient.api.v1.knowledge.activity.$get({
    query: {
      workspaceId: input.workspaceId,
      documentId: input.documentId,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to list knowledge activity.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeActivityEvent[]>
}

export async function searchKnowledgeSemantic(input: {
  readonly workspaceId: string
  readonly query: string
  readonly limit?: number
}) {
  const response = await apiClient.api.v1.knowledge.search.semantic.$post({
    json: {
      workspaceId: input.workspaceId,
      query: input.query,
      limit: input.limit ?? 8,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to run semantic search.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeSearchResult[]>
}

export async function answerKnowledge(input: {
  readonly workspaceId: string
  readonly query: string
  readonly limit?: number
}) {
  const response = await apiClient.api.v1.knowledge.answer.$post({
    json: {
      workspaceId: input.workspaceId,
      query: input.query,
      limit: input.limit ?? 8,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to generate cited answer.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeCitedAnswer>
}

export async function addKnowledgeRelation(input: {
  readonly workspaceId: string
  readonly fromDocumentId: string
  readonly relationType:
    | "references"
    | "depends_on"
    | "duplicates"
    | "related_to"
  readonly toDocumentId: string
  readonly confidence?: number
}) {
  const response = await apiClient.api.v1.knowledge.relations.$post({
    json: {
      ...input,
      confidence: input.confidence ?? 0.6,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to add knowledge relation.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeRelation>
}

export async function listKnowledgeRelations(input: {
  readonly workspaceId: string
  readonly documentId: string
}) {
  const response = await apiClient.api.v1.knowledge.relations.$get({
    query: {
      workspaceId: input.workspaceId,
      documentId: input.documentId,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to list knowledge relations.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeRelation[]>
}

export async function extractKnowledgeEntities(input: {
  readonly workspaceId: string
  readonly documentId: string
}) {
  const response = await apiClient.api.v1.knowledge.entities.extract.$post({
    json: input,
  })
  if (!response.ok) {
    throw new Error("Failed to extract knowledge entities.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeEntity[]>
}

export async function runKnowledgeWorkflowAlpha(input: {
  readonly workspaceId: string
  readonly documentId: string
  readonly plugin: "summary" | "action-items" | "follow-up-checklist"
}) {
  const response = await apiClient.api.v1.knowledge.workflow.alpha.$post({
    json: input,
  })
  if (!response.ok) {
    throw new Error("Failed to run knowledge workflow alpha.")
  }
  return (await response.json()) as WebSuccessEnvelope<{
    plugin: string
    documentId: string
    output: Record<string, unknown>
    generatedAt: string
  }>
}

export async function getKnowledgeIntelligenceKpis(input: {
  readonly workspaceId: string
}) {
  const response = await apiClient.api.v1.knowledge.metrics.intelligence.$get({
    query: {
      workspaceId: input.workspaceId,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to load intelligence KPIs.")
  }
  return (await response.json()) as WebSuccessEnvelope<KnowledgeIntelligenceKpis>
}
