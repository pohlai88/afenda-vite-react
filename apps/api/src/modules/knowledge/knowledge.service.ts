import { hashTruthRecordEnvelope } from "../../truth/truth-writer.js"

import { db, insertAuditLog, type DatabaseClient } from "@afenda/database"
import { truthRecords } from "@afenda/database/schema"
import {
  buildCitedKnowledgeAnswer,
  DEFAULT_KNOWLEDGE_WORKFLOW_PLUGIN_REGISTRY,
  type KnowledgeAnswer,
  runHybridSemanticKnowledgeSearch,
  runKnowledgeWorkflowPluginAlpha,
} from "@afenda/knowledge-ai"
import {
  chunkKnowledgeRecord,
  embedKnowledgeChunks,
  type KnowledgeChunk,
} from "@afenda/knowledge-indexer"
import { and, desc, eq } from "drizzle-orm"
import {
  type KnowledgeActivityEvent,
  type KnowledgeEntity,
  type KnowledgeEntityExtractRequest,
  type KnowledgeIntelligenceKpis,
  type KnowledgeRelation,
  type KnowledgeRelationCreate,
  type KnowledgeSemanticSearchRequest,
  type KnowledgeWorkflowAlphaRequest,
  type KnowledgeWorkflowAlphaResult,
  type KnowledgeAttachmentIndexRecord,
  type KnowledgeAttachmentIndexRequest,
  type KnowledgeComment,
  type KnowledgeCommentInput,
  type KnowledgeCaptureInput,
  type KnowledgeChunkIndexRecord,
  type KnowledgeCaptureRecord,
  type KnowledgeRevision,
  type KnowledgeSearchQualityMetrics,
  type KnowledgeSearchQuery,
  type KnowledgeSharingRule,
  type KnowledgeSharingRulesInput,
  knowledgeAttachmentIndexRecordSchema,
  knowledgeEntitySchema,
  knowledgeIntelligenceKpisSchema,
  knowledgeRelationSchema,
  knowledgeSemanticSearchRequestSchema,
  knowledgeWorkflowAlphaResultSchema,
  knowledgeCommentSchema,
  knowledgeSearchQualityMetricsSchema,
  knowledgeSharingRuleSchema,
  knowledgeRevisionSchema,
  knowledgeCaptureRecordSchema,
  knowledgeSearchQuerySchema,
  knowledgeChunkIndexRecordSchema,
} from "@afenda/knowledge-contracts"
import { createKnowledgeCaptureRecord } from "@afenda/knowledge-domain"
import {
  runLexicalKnowledgeSearch,
  type KnowledgeSearchResult,
} from "@afenda/knowledge-search"
import { getBetterAuthRuntime } from "../../api-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../../api-env.js"

const records: KnowledgeCaptureRecord[] = []
const comments: KnowledgeComment[] = []
const revisions: KnowledgeRevision[] = []
const relationsById = new Map<string, KnowledgeRelation>()
const extractedEntities: KnowledgeEntity[] = []
const workflowById = new Map<string, KnowledgeWorkflowAlphaResult>()
const sharingRulesByWorkspace = new Map<string, KnowledgeSharingRule[]>()
const attachmentIndexByWorkspace = new Map<
  string,
  KnowledgeAttachmentIndexRecord[]
>()
const chunksByWorkspace = new Map<string, KnowledgeChunk[]>()
const searchMetricsByWorkspace = new Map<
  string,
  {
    queryCount: number
    zeroResultCount: number
    totalResults: number
    totalLatencyMs: number
    lastQueryAt: Date | null
  }
>()
const intelligenceMetricsByWorkspace = new Map<
  string,
  {
    semanticQueryCount: number
    answerQueryCount: number
    totalCitationCount: number
    relationCount: number
    entityExtractionCount: number
    workflowRunCount: number
    lastSemanticSearchLatencyMs: number | null
    lastRetrievalMode: "semantic" | "hybrid" | "lexical_fallback" | null
    lastActivityAt: Date | null
  }
>()

function createId() {
  return `kn_${crypto.randomUUID()}`
}

function ensureSearchMetrics(workspaceId: string) {
  const existing = searchMetricsByWorkspace.get(workspaceId)
  if (existing) {
    return existing
  }

  const created = {
    queryCount: 0,
    zeroResultCount: 0,
    totalResults: 0,
    totalLatencyMs: 0,
    lastQueryAt: null as Date | null,
  }
  searchMetricsByWorkspace.set(workspaceId, created)
  return created
}

function computeSearchQualityMetrics(
  workspaceId: string
): KnowledgeSearchQualityMetrics {
  const metrics = ensureSearchMetrics(workspaceId)
  const avgLatencyMs =
    metrics.queryCount > 0 ? metrics.totalLatencyMs / metrics.queryCount : 0

  return knowledgeSearchQualityMetricsSchema.parse({
    workspaceId,
    queryCount: metrics.queryCount,
    zeroResultCount: metrics.zeroResultCount,
    totalResults: metrics.totalResults,
    avgLatencyMs,
    lastQueryAt: metrics.lastQueryAt,
  })
}

function ensureIntelligenceMetrics(workspaceId: string) {
  const existing = intelligenceMetricsByWorkspace.get(workspaceId)
  if (existing) {
    return existing
  }
  const created = {
    semanticQueryCount: 0,
    answerQueryCount: 0,
    totalCitationCount: 0,
    relationCount: 0,
    entityExtractionCount: 0,
    workflowRunCount: 0,
    lastSemanticSearchLatencyMs: null as number | null,
    lastRetrievalMode: null as
      | "semantic"
      | "hybrid"
      | "lexical_fallback"
      | null,
    lastActivityAt: null as Date | null,
  }
  intelligenceMetricsByWorkspace.set(workspaceId, created)
  return created
}

interface KnowledgeStore {
  list(input: {
    tenantId: string
    workspaceId: string
  }): Promise<KnowledgeCaptureRecord[]>
  capture(input: {
    payload: KnowledgeCaptureInput
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeCaptureRecord>
  listComments(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeComment[]>
  addComment(input: {
    payload: KnowledgeCommentInput
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeComment>
  listRevisions(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeRevision[]>
  addRevision(input: {
    payload: {
      workspaceId: string
      documentId: string
      summary: string
    }
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeRevision>
  listActivity(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeActivityEvent[]>
  addRelation(input: {
    payload: KnowledgeRelationCreate
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeRelation>
  listSearchChunks(input: {
    tenantId: string
    workspaceId: string
  }): Promise<KnowledgeChunk[]>
  listRelations(input: {
    tenantId: string
    workspaceId: string
    documentId: string
    includeSuperseded?: boolean
  }): Promise<KnowledgeRelation[]>
  extractEntities(input: {
    payload: KnowledgeEntityExtractRequest
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeEntity[]>
  runWorkflowAlpha(input: {
    payload: KnowledgeWorkflowAlphaRequest
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeWorkflowAlphaResult>
}

class InMemoryKnowledgeStore implements KnowledgeStore {
  async list(input: {
    tenantId: string
    workspaceId: string
  }): Promise<KnowledgeCaptureRecord[]> {
    return records.filter((item) => item.workspaceId === input.workspaceId)
  }

  async listSearchChunks(input: {
    tenantId: string
    workspaceId: string
  }): Promise<KnowledgeChunk[]> {
    return chunksByWorkspace.get(input.workspaceId) ?? []
  }

  async capture(input: {
    payload: KnowledgeCaptureInput
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeCaptureRecord> {
    const record = createKnowledgeCaptureRecord(
      input.payload,
      new Date(),
      createId
    )
    records.push(record)
    return record
  }

  async listComments(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeComment[]> {
    return comments.filter(
      (item) =>
        item.workspaceId === input.workspaceId &&
        item.documentId === input.documentId
    )
  }

  async addComment(input: {
    payload: KnowledgeCommentInput
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeComment> {
    const item: KnowledgeComment = {
      id: createId(),
      workspaceId: input.payload.workspaceId,
      documentId: input.payload.documentId,
      body: input.payload.body,
      mentions: input.payload.mentions,
      createdBy: input.actorId,
      createdAt: new Date(),
    }
    comments.push(item)
    return item
  }

  async listRevisions(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeRevision[]> {
    return revisions.filter(
      (item) =>
        item.workspaceId === input.workspaceId &&
        item.documentId === input.documentId
    )
  }

  async addRevision(input: {
    payload: {
      workspaceId: string
      documentId: string
      summary: string
    }
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeRevision> {
    const item: KnowledgeRevision = {
      id: createId(),
      workspaceId: input.payload.workspaceId,
      documentId: input.payload.documentId,
      summary: input.payload.summary,
      createdBy: input.actorId,
      createdAt: new Date(),
    }
    revisions.push(item)
    return item
  }

  async listActivity(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeActivityEvent[]> {
    const commentEvents = comments
      .filter(
        (item) =>
          item.workspaceId === input.workspaceId &&
          item.documentId === input.documentId
      )
      .map((item) => ({
        workspaceId: item.workspaceId,
        documentId: item.documentId,
        eventType:
          item.mentions.length > 0
            ? ("mentioned" as const)
            : ("commented" as const),
        actorId: item.createdBy,
        timestamp: item.createdAt,
        metadata: {
          commentId: item.id,
        },
      }))

    const revisionEvents = revisions
      .filter(
        (item) =>
          item.workspaceId === input.workspaceId &&
          item.documentId === input.documentId
      )
      .map((item) => ({
        workspaceId: item.workspaceId,
        documentId: item.documentId,
        eventType: "revised" as const,
        actorId: item.createdBy,
        timestamp: item.createdAt,
        metadata: {
          revisionId: item.id,
          summary: item.summary,
        },
      }))

    return [...commentEvents, ...revisionEvents].sort(
      (left, right) => right.timestamp.getTime() - left.timestamp.getTime()
    )
  }

  async addRelation(input: {
    payload: KnowledgeRelationCreate
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeRelation> {
    const id = createId()
    if (input.payload.supersedes) {
      const prev = relationsById.get(input.payload.supersedes)
      if (prev) {
        relationsById.set(input.payload.supersedes, {
          ...prev,
          status: "superseded",
          supersededBy: id,
        })
      }
    }
    const item = knowledgeRelationSchema.parse({
      id,
      ...input.payload,
      createdAt: new Date(),
      status: "active",
      supersedes: input.payload.supersedes,
    })
    relationsById.set(id, item)
    return item
  }

  async listRelations(input: {
    tenantId: string
    workspaceId: string
    documentId: string
    includeSuperseded?: boolean
  }): Promise<KnowledgeRelation[]> {
    const include = input.includeSuperseded === true
    return [...relationsById.values()].filter(
      (item) =>
        item.workspaceId === input.workspaceId &&
        (include || item.status === "active") &&
        (item.fromDocumentId === input.documentId ||
          item.toDocumentId === input.documentId)
    )
  }

  async extractEntities(input: {
    payload: KnowledgeEntityExtractRequest
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeEntity[]> {
    const doc = records.find(
      (item) =>
        item.workspaceId === input.payload.workspaceId &&
        item.id === input.payload.documentId
    )
    if (!doc) {
      return []
    }

    const tokens = doc.content
      .split(/\W+/u)
      .map((item) => item.trim())
      .filter((item) => item.length > 2)
    const uniqueTop = [...new Set(tokens)].slice(0, 5)
    const now = new Date()
    const entities = uniqueTop.map((label, index) =>
      knowledgeEntitySchema.parse({
        id: createId(),
        workspaceId: doc.workspaceId,
        documentId: doc.id,
        label,
        entityType: index % 2 === 0 ? "domain_term" : "other",
        confidence: 0.5,
        extractedAt: now,
        status: "active",
      })
    )

    extractedEntities.push(...entities)
    return entities
  }

  async runWorkflowAlpha(input: {
    payload: KnowledgeWorkflowAlphaRequest
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeWorkflowAlphaResult> {
    const doc = records.find(
      (item) =>
        item.workspaceId === input.payload.workspaceId &&
        item.id === input.payload.documentId
    )
    const resultId = createId()
    if (input.payload.supersedes) {
      const prev = workflowById.get(input.payload.supersedes)
      if (prev) {
        workflowById.set(input.payload.supersedes, {
          ...prev,
          status: "superseded",
          supersededBy: resultId,
        })
      }
    }
    const pluginResult = runKnowledgeWorkflowPluginAlpha(
      input.payload.plugin,
      {
        workspaceId: input.payload.workspaceId,
        documentId: input.payload.documentId,
        content: doc?.content ?? "",
      },
      {},
      DEFAULT_KNOWLEDGE_WORKFLOW_PLUGIN_REGISTRY
    )
    const result = knowledgeWorkflowAlphaResultSchema.parse({
      id: resultId,
      workspaceId: input.payload.workspaceId,
      plugin: input.payload.plugin,
      documentId: input.payload.documentId,
      output: pluginResult.output,
      generatedAt: new Date(),
      status: "active",
      supersedes: input.payload.supersedes,
    })
    workflowById.set(resultId, result)
    return result
  }
}

class DbKnowledgeStore implements KnowledgeStore {
  constructor(private readonly database: DatabaseClient) {}

  async list(input: {
    tenantId: string
    workspaceId: string
  }): Promise<KnowledgeCaptureRecord[]> {
    const rows = await this.database
      .select({
        entityId: truthRecords.entityId,
        afterState: truthRecords.afterState,
      })
      .from(truthRecords)
      .where(
        and(
          eq(truthRecords.entityType, "knowledge_document"),
          eq(truthRecords.tenantId, input.tenantId)
        )
      )
      .orderBy(desc(truthRecords.timestamp))

    const latestByEntity = new Map<string, KnowledgeCaptureRecord>()
    for (const row of rows) {
      if (latestByEntity.has(row.entityId) || !row.afterState) {
        continue
      }

      const parsed = knowledgeCaptureRecordSchema.safeParse(row.afterState)
      if (parsed.success && parsed.data.workspaceId === input.workspaceId) {
        latestByEntity.set(row.entityId, parsed.data)
      }
    }

    return [...latestByEntity.values()]
  }

  async listSearchChunks(input: {
    tenantId: string
    workspaceId: string
  }): Promise<KnowledgeChunk[]> {
    const rows = await this.database
      .select({
        entityId: truthRecords.entityId,
        afterState: truthRecords.afterState,
      })
      .from(truthRecords)
      .where(
        and(
          eq(truthRecords.tenantId, input.tenantId),
          eq(truthRecords.entityType, "knowledge_chunk")
        )
      )
      .orderBy(desc(truthRecords.timestamp))

    const latestByEntity = new Map<string, KnowledgeChunkIndexRecord>()
    for (const row of rows) {
      if (latestByEntity.has(row.entityId) || !row.afterState) {
        continue
      }

      const parsed = knowledgeChunkIndexRecordSchema.safeParse(row.afterState)
      if (
        parsed.success &&
        parsed.data.workspaceId === input.workspaceId &&
        parsed.data.status === "active"
      ) {
        latestByEntity.set(row.entityId, parsed.data)
      }
    }

    return [...latestByEntity.values()].map((c) => ({
      documentId: c.documentId,
      workspaceId: c.workspaceId,
      chunkIndex: c.chunkIndex,
      text: c.text,
    }))
  }

  async capture(input: {
    payload: KnowledgeCaptureInput
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeCaptureRecord> {
    const now = new Date()
    const record = createKnowledgeCaptureRecord(input.payload, now, createId)

    const envelope = {
      tenantId: input.tenantId,
      entityType: "knowledge_document",
      entityId: record.id,
      commandType: "knowledge.capture",
      actorId: input.actorId,
      timestamp: now,
      beforeState: null,
      afterState: record as unknown as Record<string, unknown>,
      doctrineRef: "ADR-0019",
      invariantRefs: ["ATC-0017"],
      metadata: {
        workspaceId: record.workspaceId,
        source: record.source,
      },
    }

    await this.database.insert(truthRecords).values({
      tenantId: input.tenantId,
      entityType: envelope.entityType,
      entityId: envelope.entityId,
      commandType: envelope.commandType,
      actorId: envelope.actorId,
      timestamp: envelope.timestamp,
      beforeState: envelope.beforeState,
      afterState: envelope.afterState,
      doctrineRef: envelope.doctrineRef,
      invariantRefs: [...(envelope.invariantRefs ?? [])],
      hash: hashTruthRecordEnvelope(envelope),
      metadata: envelope.metadata ?? {},
    })

    await this.indexKnowledgeChunksForDocument({
      tenantId: input.tenantId,
      actorId: input.actorId,
      record,
      requestId: input.requestId,
      now,
    })

    await insertAuditLog(this.database, {
      tenantId: input.tenantId,
      membershipId: null,
      authUserId: input.actorId,
      actorType: "person",
      actorUserId: null,
      actingAsUserId: null,
      action: "knowledge.document.captured",
      subjectType: "knowledge_document",
      subjectId: record.id,
      metadata: {
        workspaceId: record.workspaceId,
        tags: record.tags,
      },
      sevenW1h: {
        which: {
          targetFeature: "knowledge-capture",
          targetEntityRef: record.id,
        },
        how: {
          mechanism: "api",
          interactionPhase: "succeeded",
        },
      },
      sourceChannel: "api",
      requestId: input.requestId,
      outcome: "success",
    })

    return record
  }

  async listComments(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeComment[]> {
    return this.listByEntityType(
      "knowledge_comment",
      input,
      knowledgeCommentSchema
    )
  }

  async addComment(input: {
    payload: KnowledgeCommentInput
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeComment> {
    const now = new Date()
    const item: KnowledgeComment = {
      id: createId(),
      workspaceId: input.payload.workspaceId,
      documentId: input.payload.documentId,
      body: input.payload.body,
      mentions: input.payload.mentions,
      createdBy: input.actorId,
      createdAt: now,
    }

    await this.insertTruthRecord({
      tenantId: input.tenantId,
      entityType: "knowledge_comment",
      entityId: item.id,
      commandType: "knowledge.comment.add",
      actorId: input.actorId,
      timestamp: now,
      beforeState: null,
      afterState: item as unknown as Record<string, unknown>,
      doctrineRef: "ADR-0019",
      invariantRefs: ["ATC-0017"],
      metadata: {
        workspaceId: item.workspaceId,
        documentId: item.documentId,
      },
    })

    await insertAuditLog(this.database, {
      tenantId: input.tenantId,
      membershipId: null,
      authUserId: input.actorId,
      actorType: "person",
      actorUserId: null,
      actingAsUserId: null,
      action: "knowledge.document.commented",
      subjectType: "knowledge_document",
      subjectId: item.documentId,
      metadata: {
        commentId: item.id,
        mentions: item.mentions,
      },
      sevenW1h: {
        which: {
          targetFeature: "knowledge-comment",
          targetEntityRef: item.documentId,
        },
        how: {
          mechanism: "api",
          interactionPhase: "succeeded",
        },
      },
      sourceChannel: "api",
      requestId: input.requestId,
      outcome: "success",
    })

    return item
  }

  async listRevisions(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeRevision[]> {
    return this.listByEntityType(
      "knowledge_revision",
      input,
      knowledgeRevisionSchema
    )
  }

  async addRevision(input: {
    payload: {
      workspaceId: string
      documentId: string
      summary: string
    }
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeRevision> {
    const now = new Date()
    const item: KnowledgeRevision = {
      id: createId(),
      workspaceId: input.payload.workspaceId,
      documentId: input.payload.documentId,
      summary: input.payload.summary,
      createdBy: input.actorId,
      createdAt: now,
    }

    await this.insertTruthRecord({
      tenantId: input.tenantId,
      entityType: "knowledge_revision",
      entityId: item.id,
      commandType: "knowledge.revision.add",
      actorId: input.actorId,
      timestamp: now,
      beforeState: null,
      afterState: item as unknown as Record<string, unknown>,
      doctrineRef: "ADR-0019",
      invariantRefs: ["ATC-0017"],
      metadata: {
        workspaceId: item.workspaceId,
        documentId: item.documentId,
      },
    })

    await insertAuditLog(this.database, {
      tenantId: input.tenantId,
      membershipId: null,
      authUserId: input.actorId,
      actorType: "person",
      actorUserId: null,
      actingAsUserId: null,
      action: "knowledge.document.revised",
      subjectType: "knowledge_document",
      subjectId: item.documentId,
      metadata: {
        revisionId: item.id,
        summary: item.summary,
      },
      sevenW1h: {
        which: {
          targetFeature: "knowledge-revision",
          targetEntityRef: item.documentId,
        },
        how: {
          mechanism: "api",
          interactionPhase: "succeeded",
        },
      },
      sourceChannel: "api",
      requestId: input.requestId,
      outcome: "success",
    })

    return item
  }

  async listActivity(input: {
    tenantId: string
    workspaceId: string
    documentId: string
  }): Promise<KnowledgeActivityEvent[]> {
    const rows = await this.database
      .select({
        timestamp: truthRecords.timestamp,
        afterState: truthRecords.afterState,
      })
      .from(truthRecords)
      .where(
        and(
          eq(truthRecords.tenantId, input.tenantId),
          eq(truthRecords.entityType, "knowledge_document")
        )
      )
      .orderBy(desc(truthRecords.timestamp))

    const events: KnowledgeActivityEvent[] = []
    for (const row of rows) {
      if (!row.afterState) {
        continue
      }

      const capture = knowledgeCaptureRecordSchema.safeParse(row.afterState)
      if (
        capture.success &&
        capture.data.workspaceId === input.workspaceId &&
        capture.data.id === input.documentId
      ) {
        events.push({
          workspaceId: capture.data.workspaceId,
          documentId: capture.data.id,
          eventType: "captured",
          actorId: "system",
          timestamp: capture.data.createdAt,
        })
      }
    }

    const commentEvents = (await this.listComments(input)).map((item) => ({
      workspaceId: item.workspaceId,
      documentId: item.documentId,
      eventType:
        item.mentions.length > 0
          ? ("mentioned" as const)
          : ("commented" as const),
      actorId: item.createdBy,
      timestamp: item.createdAt,
      metadata: {
        commentId: item.id,
      },
    }))

    const revisionEvents = (await this.listRevisions(input)).map((item) => ({
      workspaceId: item.workspaceId,
      documentId: item.documentId,
      eventType: "revised" as const,
      actorId: item.createdBy,
      timestamp: item.createdAt,
      metadata: {
        revisionId: item.id,
        summary: item.summary,
      },
    }))

    return [...events, ...commentEvents, ...revisionEvents].sort(
      (left, right) => right.timestamp.getTime() - left.timestamp.getTime()
    )
  }

  private async insertTruthRecord(input: {
    tenantId: string
    entityType: string
    entityId: string
    commandType: string
    actorId: string
    timestamp: Date
    beforeState: Record<string, unknown> | null
    afterState: Record<string, unknown> | null
    doctrineRef?: string | null
    invariantRefs?: readonly string[]
    metadata?: Record<string, unknown>
  }): Promise<void> {
    await this.database.insert(truthRecords).values({
      tenantId: input.tenantId,
      entityType: input.entityType,
      entityId: input.entityId,
      commandType: input.commandType,
      actorId: input.actorId,
      timestamp: input.timestamp,
      beforeState: input.beforeState,
      afterState: input.afterState,
      doctrineRef: input.doctrineRef,
      invariantRefs: [...(input.invariantRefs ?? [])],
      hash: hashTruthRecordEnvelope({
        tenantId: input.tenantId,
        entityType: input.entityType,
        entityId: input.entityId,
        commandType: input.commandType,
        actorId: input.actorId,
        timestamp: input.timestamp,
        beforeState: input.beforeState,
        afterState: input.afterState,
        doctrineRef: input.doctrineRef ?? null,
        invariantRefs: input.invariantRefs,
        metadata: input.metadata,
      }),
      metadata: input.metadata ?? {},
    })
  }

  private async readLatestRelationTruth(
    tenantId: string,
    entityId: string
  ): Promise<KnowledgeRelation | null> {
    const rows = await this.database
      .select({ afterState: truthRecords.afterState })
      .from(truthRecords)
      .where(
        and(
          eq(truthRecords.tenantId, tenantId),
          eq(truthRecords.entityType, "knowledge_relation"),
          eq(truthRecords.entityId, entityId)
        )
      )
      .orderBy(desc(truthRecords.timestamp))
      .limit(1)
    const row = rows[0]
    if (!row?.afterState) {
      return null
    }
    const parsed = knowledgeRelationSchema.safeParse(row.afterState)
    return parsed.success ? parsed.data : null
  }

  private async readLatestWorkflowResultTruth(
    tenantId: string,
    entityId: string
  ): Promise<KnowledgeWorkflowAlphaResult | null> {
    const rows = await this.database
      .select({ afterState: truthRecords.afterState })
      .from(truthRecords)
      .where(
        and(
          eq(truthRecords.tenantId, tenantId),
          eq(truthRecords.entityType, "knowledge_workflow_result"),
          eq(truthRecords.entityId, entityId)
        )
      )
      .orderBy(desc(truthRecords.timestamp))
      .limit(1)
    const row = rows[0]
    if (!row?.afterState) {
      return null
    }
    const parsed = knowledgeWorkflowAlphaResultSchema.safeParse(row.afterState)
    return parsed.success ? parsed.data : null
  }

  private async indexKnowledgeChunksForDocument(input: {
    tenantId: string
    actorId: string
    record: KnowledgeCaptureRecord
    requestId?: string
    now: Date
  }): Promise<void> {
    const raw = chunkKnowledgeRecord(input.record)
    const embedded = embedKnowledgeChunks(raw)
    for (const ch of embedded) {
      const chunkEntityId = createId()
      const row = knowledgeChunkIndexRecordSchema.parse({
        id: chunkEntityId,
        workspaceId: input.record.workspaceId,
        documentId: input.record.id,
        chunkIndex: ch.chunkIndex,
        text: ch.text,
        embedding: [...ch.embedding],
        embeddingModel: ch.embeddingModel,
        indexedAt: input.now,
        status: "active",
      })
      await this.insertTruthRecord({
        tenantId: input.tenantId,
        entityType: "knowledge_chunk",
        entityId: chunkEntityId,
        commandType: "knowledge.chunk.index",
        actorId: input.actorId,
        timestamp: input.now,
        beforeState: null,
        afterState: row as unknown as Record<string, unknown>,
        doctrineRef: "ADR-0019",
        invariantRefs: ["ATC-0017"],
        metadata: {
          workspaceId: row.workspaceId,
          documentId: row.documentId,
          chunkIndex: row.chunkIndex,
        },
      })
    }
  }

  private async listByEntityType<T>(
    entityType: string,
    input: {
      tenantId: string
      workspaceId: string
      documentId: string
    },
    parse: {
      safeParse: (
        value: unknown
      ) => { success: true; data: T } | { success: false }
    }
  ): Promise<T[]> {
    const rows = await this.database
      .select({
        entityId: truthRecords.entityId,
        afterState: truthRecords.afterState,
      })
      .from(truthRecords)
      .where(
        and(
          eq(truthRecords.tenantId, input.tenantId),
          eq(truthRecords.entityType, entityType)
        )
      )
      .orderBy(desc(truthRecords.timestamp))

    const latestByEntity = new Map<string, T>()
    for (const row of rows) {
      if (latestByEntity.has(row.entityId) || !row.afterState) {
        continue
      }

      const parsed = parse.safeParse(row.afterState)
      if (
        parsed.success &&
        (parsed.data as { workspaceId?: string; documentId?: string })
          .workspaceId === input.workspaceId &&
        (parsed.data as { workspaceId?: string; documentId?: string })
          .documentId === input.documentId
      ) {
        latestByEntity.set(row.entityId, parsed.data)
      }
    }

    return [...latestByEntity.values()]
  }

  async addRelation(input: {
    payload: KnowledgeRelationCreate
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeRelation> {
    const now = new Date()
    const relationId = createId()
    if (input.payload.supersedes) {
      const prev = await this.readLatestRelationTruth(
        input.tenantId,
        input.payload.supersedes
      )
      if (prev) {
        await this.insertTruthRecord({
          tenantId: input.tenantId,
          entityType: "knowledge_relation",
          entityId: input.payload.supersedes,
          commandType: "knowledge.relation.supersede",
          actorId: input.actorId,
          timestamp: now,
          beforeState: null,
          afterState: {
            ...prev,
            status: "superseded",
            supersededBy: relationId,
          } as unknown as Record<string, unknown>,
          doctrineRef: "ADR-0019",
          invariantRefs: ["ATC-0017"],
          metadata: {
            workspaceId: prev.workspaceId,
            fromDocumentId: prev.fromDocumentId,
            toDocumentId: prev.toDocumentId,
            relationType: prev.relationType,
          },
        })
      }
    }
    const item = knowledgeRelationSchema.parse({
      id: relationId,
      ...input.payload,
      createdAt: now,
      status: "active",
      supersedes: input.payload.supersedes,
    })

    await this.insertTruthRecord({
      tenantId: input.tenantId,
      entityType: "knowledge_relation",
      entityId: relationId,
      commandType: "knowledge.relation.add",
      actorId: input.actorId,
      timestamp: now,
      beforeState: null,
      afterState: item as unknown as Record<string, unknown>,
      doctrineRef: "ADR-0019",
      invariantRefs: ["ATC-0017"],
      metadata: {
        workspaceId: item.workspaceId,
        fromDocumentId: item.fromDocumentId,
        toDocumentId: item.toDocumentId,
        relationType: item.relationType,
      },
    })

    await insertAuditLog(this.database, {
      tenantId: input.tenantId,
      membershipId: null,
      authUserId: input.actorId,
      actorType: "person",
      actorUserId: null,
      actingAsUserId: null,
      action: "knowledge.document.related",
      subjectType: "knowledge_document",
      subjectId: item.fromDocumentId,
      metadata: {
        relationType: item.relationType,
        toDocumentId: item.toDocumentId,
        confidence: item.confidence,
      },
      sevenW1h: {
        which: {
          targetFeature: "knowledge-relation",
          targetEntityRef: item.fromDocumentId,
        },
        how: {
          mechanism: "api",
          interactionPhase: "succeeded",
        },
      },
      sourceChannel: "api",
      requestId: input.requestId,
      outcome: "success",
    })

    return item
  }

  async listRelations(input: {
    tenantId: string
    workspaceId: string
    documentId: string
    includeSuperseded?: boolean
  }): Promise<KnowledgeRelation[]> {
    const include = input.includeSuperseded === true
    const rows = await this.database
      .select({
        entityId: truthRecords.entityId,
        afterState: truthRecords.afterState,
      })
      .from(truthRecords)
      .where(
        and(
          eq(truthRecords.tenantId, input.tenantId),
          eq(truthRecords.entityType, "knowledge_relation")
        )
      )
      .orderBy(desc(truthRecords.timestamp))

    const latestByEntity = new Map<string, KnowledgeRelation>()
    for (const row of rows) {
      if (latestByEntity.has(row.entityId) || !row.afterState) {
        continue
      }

      const parsed = knowledgeRelationSchema.safeParse(row.afterState)
      if (
        parsed.success &&
        (include || parsed.data.status === "active") &&
        parsed.data.workspaceId === input.workspaceId &&
        (parsed.data.fromDocumentId === input.documentId ||
          parsed.data.toDocumentId === input.documentId)
      ) {
        latestByEntity.set(row.entityId, parsed.data)
      }
    }

    return [...latestByEntity.values()]
  }

  async extractEntities(input: {
    payload: KnowledgeEntityExtractRequest
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeEntity[]> {
    const docs = await this.list({
      tenantId: input.tenantId,
      workspaceId: input.payload.workspaceId,
    })
    const doc = docs.find((item) => item.id === input.payload.documentId)
    if (!doc) {
      return []
    }

    const tokens = doc.content
      .split(/\W+/u)
      .map((item) => item.trim())
      .filter((item) => item.length > 2)
    const uniqueTop = [...new Set(tokens)].slice(0, 5)
    const now = new Date()
    const entities = uniqueTop.map((label, index) => {
      const id = createId()
      return knowledgeEntitySchema.parse({
        id,
        workspaceId: doc.workspaceId,
        documentId: doc.id,
        label,
        entityType: index % 2 === 0 ? "domain_term" : "other",
        confidence: 0.5,
        extractedAt: now,
        status: "active",
      })
    })

    for (const entity of entities) {
      await this.insertTruthRecord({
        tenantId: input.tenantId,
        entityType: "knowledge_entity",
        entityId: entity.id,
        commandType: "knowledge.entity.extract",
        actorId: input.actorId,
        timestamp: now,
        beforeState: null,
        afterState: entity as unknown as Record<string, unknown>,
        doctrineRef: "ADR-0019",
        invariantRefs: ["ATC-0017"],
        metadata: {
          workspaceId: entity.workspaceId,
          documentId: entity.documentId,
          label: entity.label,
          entityType: entity.entityType,
        },
      })
    }

    await insertAuditLog(this.database, {
      tenantId: input.tenantId,
      membershipId: null,
      authUserId: input.actorId,
      actorType: "person",
      actorUserId: null,
      actingAsUserId: null,
      action: "knowledge.document.entities_extracted",
      subjectType: "knowledge_document",
      subjectId: doc.id,
      metadata: {
        extractedCount: entities.length,
      },
      sevenW1h: {
        which: {
          targetFeature: "knowledge-entity",
          targetEntityRef: doc.id,
        },
        how: {
          mechanism: "api",
          interactionPhase: "succeeded",
        },
      },
      sourceChannel: "api",
      requestId: input.requestId,
      outcome: "success",
    })

    return entities
  }

  async runWorkflowAlpha(input: {
    payload: KnowledgeWorkflowAlphaRequest
    tenantId: string
    actorId: string
    requestId?: string
  }): Promise<KnowledgeWorkflowAlphaResult> {
    const now = new Date()
    const docs = await this.list({
      tenantId: input.tenantId,
      workspaceId: input.payload.workspaceId,
    })
    const doc = docs.find((item) => item.id === input.payload.documentId)
    const resultId = createId()
    if (input.payload.supersedes) {
      const prev = await this.readLatestWorkflowResultTruth(
        input.tenantId,
        input.payload.supersedes
      )
      if (prev) {
        await this.insertTruthRecord({
          tenantId: input.tenantId,
          entityType: "knowledge_workflow_result",
          entityId: input.payload.supersedes,
          commandType: "knowledge.workflow.alpha.supersede",
          actorId: input.actorId,
          timestamp: now,
          beforeState: null,
          afterState: {
            ...prev,
            status: "superseded",
            supersededBy: resultId,
          } as unknown as Record<string, unknown>,
          doctrineRef: "ADR-0019",
          invariantRefs: ["ATC-0017"],
          metadata: {
            workspaceId: prev.workspaceId,
            documentId: prev.documentId,
            plugin: prev.plugin,
          },
        })
      }
    }
    const pluginResult = runKnowledgeWorkflowPluginAlpha(
      input.payload.plugin,
      {
        workspaceId: input.payload.workspaceId,
        documentId: input.payload.documentId,
        content: doc?.content ?? "",
      },
      {},
      DEFAULT_KNOWLEDGE_WORKFLOW_PLUGIN_REGISTRY
    )
    const result = knowledgeWorkflowAlphaResultSchema.parse({
      id: resultId,
      workspaceId: input.payload.workspaceId,
      plugin: input.payload.plugin,
      documentId: input.payload.documentId,
      output: pluginResult.output,
      generatedAt: now,
      status: "active",
      supersedes: input.payload.supersedes,
    })

    await this.insertTruthRecord({
      tenantId: input.tenantId,
      entityType: "knowledge_workflow_result",
      entityId: resultId,
      commandType: "knowledge.workflow.alpha.run",
      actorId: input.actorId,
      timestamp: now,
      beforeState: null,
      afterState: result as unknown as Record<string, unknown>,
      doctrineRef: "ADR-0019",
      invariantRefs: ["ATC-0017"],
      metadata: {
        workspaceId: result.workspaceId,
        documentId: result.documentId,
        plugin: result.plugin,
      },
    })

    await insertAuditLog(this.database, {
      tenantId: input.tenantId,
      membershipId: null,
      authUserId: input.actorId,
      actorType: "person",
      actorUserId: null,
      actingAsUserId: null,
      action: "knowledge.document.workflow_alpha",
      subjectType: "knowledge_document",
      subjectId: result.documentId,
      metadata: {
        plugin: result.plugin,
      },
      sevenW1h: {
        which: {
          targetFeature: "knowledge-workflow-alpha",
          targetEntityRef: result.documentId,
        },
        how: {
          mechanism: "api",
          interactionPhase: "succeeded",
        },
      },
      sourceChannel: "api",
      requestId: input.requestId,
      outcome: "success",
    })

    return result
  }
}

function selectKnowledgeStore(): KnowledgeStore {
  if (process.env.NODE_ENV === "test" || !hasBetterAuthRuntimeEnv()) {
    return new InMemoryKnowledgeStore()
  }

  const runtime = getBetterAuthRuntime() as ReturnType<
    typeof getBetterAuthRuntime
  > & {
    db?: DatabaseClient
  }

  if (runtime.db) {
    return new DbKnowledgeStore(runtime.db)
  }

  return new DbKnowledgeStore(db)
}

const knowledgeStore = selectKnowledgeStore()

async function computeKnowledgeIntelligenceKpis(
  tenantId: string,
  workspaceId: string
): Promise<KnowledgeIntelligenceKpis> {
  const metrics = ensureIntelligenceMetrics(workspaceId)
  const indexedChunkCount = (
    await knowledgeStore.listSearchChunks({ tenantId, workspaceId })
  ).length
  return knowledgeIntelligenceKpisSchema.parse({
    workspaceId,
    semanticQueryCount: metrics.semanticQueryCount,
    answerQueryCount: metrics.answerQueryCount,
    totalCitationCount: metrics.totalCitationCount,
    relationCount: metrics.relationCount,
    entityExtractionCount: metrics.entityExtractionCount,
    workflowRunCount: metrics.workflowRunCount,
    indexedChunkCount,
    lastSemanticSearchLatencyMs: metrics.lastSemanticSearchLatencyMs,
    lastRetrievalMode: metrics.lastRetrievalMode,
    lastActivityAt: metrics.lastActivityAt,
  })
}

export async function listKnowledgeDocuments(input: {
  tenantId: string
  workspaceId: string
}): Promise<KnowledgeCaptureRecord[]> {
  return knowledgeStore.list(input)
}

export async function captureKnowledgeDocument(input: {
  payload: KnowledgeCaptureInput
  tenantId: string
  actorId: string
  requestId?: string
}): Promise<KnowledgeCaptureRecord> {
  const record = await knowledgeStore.capture(input)
  const existing = chunksByWorkspace.get(record.workspaceId) ?? []
  const next = chunkKnowledgeRecord(record)
  chunksByWorkspace.set(
    record.workspaceId,
    existing.filter((item) => item.documentId !== record.id).concat(next)
  )
  return record
}

export async function searchKnowledge(input: {
  tenantId: string
  query: KnowledgeSearchQuery
}): Promise<KnowledgeSearchResult[]> {
  const startedAt = Date.now()
  const query = knowledgeSearchQuerySchema.parse(input.query)
  const snapshot = await knowledgeStore.list({
    tenantId: input.tenantId,
    workspaceId: query.workspaceId,
  })
  const results = runLexicalKnowledgeSearch(snapshot, query)
  const metrics = ensureSearchMetrics(query.workspaceId)
  metrics.queryCount += 1
  metrics.totalResults += results.length
  metrics.totalLatencyMs += Date.now() - startedAt
  metrics.lastQueryAt = new Date()
  if (results.length === 0) {
    metrics.zeroResultCount += 1
  }

  return results
}

export async function semanticKnowledgeSearch(input: {
  tenantId: string
  query: KnowledgeSemanticSearchRequest
}): Promise<KnowledgeSearchResult[]> {
  const startedAt = Date.now()
  const normalized = knowledgeSemanticSearchRequestSchema.parse(input.query)
  const snapshot = await knowledgeStore.list({
    tenantId: input.tenantId,
    workspaceId: normalized.workspaceId,
  })
  const chunks = await knowledgeStore.listSearchChunks({
    tenantId: input.tenantId,
    workspaceId: normalized.workspaceId,
  })
  const hybrid = runHybridSemanticKnowledgeSearch({
    documents: snapshot,
    chunks,
    workspaceId: normalized.workspaceId,
    query: normalized.query,
    limit: normalized.limit,
  })
  const metrics = ensureIntelligenceMetrics(normalized.workspaceId)
  metrics.semanticQueryCount += 1
  metrics.lastActivityAt = new Date()
  metrics.lastSemanticSearchLatencyMs = Date.now() - startedAt
  metrics.lastRetrievalMode = hybrid.mode
  return hybrid.results
}

export async function answerKnowledgeQuestion(input: {
  tenantId: string
  query: KnowledgeSemanticSearchRequest
}): Promise<KnowledgeAnswer> {
  const results = await semanticKnowledgeSearch(input)
  const answer = buildCitedKnowledgeAnswer(input.query.query, results)
  const metrics = ensureIntelligenceMetrics(input.query.workspaceId)
  metrics.answerQueryCount += 1
  metrics.totalCitationCount += answer.citations.length
  metrics.lastActivityAt = new Date()
  return answer
}

export async function listKnowledgeComments(input: {
  tenantId: string
  workspaceId: string
  documentId: string
}): Promise<KnowledgeComment[]> {
  return knowledgeStore.listComments(input)
}

export async function addKnowledgeComment(input: {
  payload: KnowledgeCommentInput
  tenantId: string
  actorId: string
  requestId?: string
}): Promise<KnowledgeComment> {
  return knowledgeStore.addComment(input)
}

export async function listKnowledgeRevisions(input: {
  tenantId: string
  workspaceId: string
  documentId: string
}): Promise<KnowledgeRevision[]> {
  return knowledgeStore.listRevisions(input)
}

export async function addKnowledgeRevision(input: {
  payload: {
    workspaceId: string
    documentId: string
    summary: string
  }
  tenantId: string
  actorId: string
  requestId?: string
}): Promise<KnowledgeRevision> {
  return knowledgeStore.addRevision(input)
}

export async function listKnowledgeActivity(input: {
  tenantId: string
  workspaceId: string
  documentId: string
}): Promise<KnowledgeActivityEvent[]> {
  return knowledgeStore.listActivity(input)
}

export async function getKnowledgeSearchQualityMetrics(input: {
  workspaceId: string
}): Promise<KnowledgeSearchQualityMetrics> {
  return computeSearchQualityMetrics(input.workspaceId)
}

export async function getKnowledgeIntelligenceKpis(input: {
  tenantId: string
  workspaceId: string
}): Promise<KnowledgeIntelligenceKpis> {
  return computeKnowledgeIntelligenceKpis(input.tenantId, input.workspaceId)
}

export async function upsertKnowledgeSharingRules(input: {
  payload: KnowledgeSharingRulesInput
}): Promise<KnowledgeSharingRule[]> {
  const normalized = input.payload.rules.map((item) =>
    knowledgeSharingRuleSchema.parse(item)
  )
  sharingRulesByWorkspace.set(input.payload.workspaceId, normalized)
  return normalized
}

export async function listKnowledgeSharingRules(input: {
  workspaceId: string
}): Promise<KnowledgeSharingRule[]> {
  return sharingRulesByWorkspace.get(input.workspaceId) ?? []
}

export async function queueKnowledgeAttachmentIndex(input: {
  payload: KnowledgeAttachmentIndexRequest
}): Promise<KnowledgeAttachmentIndexRecord> {
  const record = knowledgeAttachmentIndexRecordSchema.parse({
    workspaceId: input.payload.workspaceId,
    documentId: input.payload.documentId,
    attachmentName: input.payload.attachmentName,
    status: "queued",
    createdAt: new Date(),
  })

  const existing = attachmentIndexByWorkspace.get(record.workspaceId) ?? []
  existing.push(record)
  attachmentIndexByWorkspace.set(record.workspaceId, existing)
  return record
}

export async function listKnowledgeAttachmentIndex(input: {
  workspaceId: string
  documentId?: string
}): Promise<KnowledgeAttachmentIndexRecord[]> {
  const items = attachmentIndexByWorkspace.get(input.workspaceId) ?? []
  if (!input.documentId) {
    return items
  }
  return items.filter((item) => item.documentId === input.documentId)
}

export async function addKnowledgeRelation(input: {
  payload: KnowledgeRelationCreate
  tenantId: string
  actorId: string
  requestId?: string
}): Promise<KnowledgeRelation> {
  const relation = await knowledgeStore.addRelation(input)
  const metrics = ensureIntelligenceMetrics(relation.workspaceId)
  metrics.relationCount += 1
  metrics.lastActivityAt = new Date()
  return relation
}

export async function listKnowledgeRelations(input: {
  tenantId: string
  workspaceId: string
  documentId: string
  includeSuperseded?: boolean
}): Promise<KnowledgeRelation[]> {
  return knowledgeStore.listRelations(input)
}

export async function extractKnowledgeEntities(input: {
  tenantId: string
  payload: KnowledgeEntityExtractRequest
  actorId: string
  requestId?: string
}): Promise<KnowledgeEntity[]> {
  const entities = await knowledgeStore.extractEntities(input)
  const metrics = ensureIntelligenceMetrics(input.payload.workspaceId)
  metrics.entityExtractionCount += entities.length
  metrics.lastActivityAt = new Date()
  return entities
}

export async function runKnowledgeWorkflowAlpha(input: {
  payload: KnowledgeWorkflowAlphaRequest
  tenantId: string
  actorId: string
  requestId?: string
}): Promise<KnowledgeWorkflowAlphaResult> {
  const result = await knowledgeStore.runWorkflowAlpha(input)
  const metrics = ensureIntelligenceMetrics(result.workspaceId)
  metrics.workflowRunCount += 1
  metrics.lastActivityAt = new Date()
  return result
}

export function __resetKnowledgeForTests(): void {
  records.splice(0, records.length)
  comments.splice(0, comments.length)
  revisions.splice(0, revisions.length)
  relationsById.clear()
  extractedEntities.splice(0, extractedEntities.length)
  workflowById.clear()
  sharingRulesByWorkspace.clear()
  attachmentIndexByWorkspace.clear()
  chunksByWorkspace.clear()
  searchMetricsByWorkspace.clear()
  intelligenceMetricsByWorkspace.clear()
}
