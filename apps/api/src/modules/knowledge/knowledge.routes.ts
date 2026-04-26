import { zValidator } from "@hono/zod-validator"
import {
  type KnowledgeCaptureInput,
  knowledgeCaptureInputSchema,
} from "@afenda/knowledge-contracts"
import { Hono } from "hono"
import type { Context } from "hono"

import { success } from "../../api-response.js"
import type { ApiEnv } from "../../contract/request-context.contract.js"
import { resolveActorAuthorityForTenant } from "../../command/execute-command.js"
import {
  knowledgeDocumentViewPermission,
  knowledgeDocumentWritePermission,
} from "./knowledge.contract.js"
import {
  addKnowledgeRelation,
  addKnowledgeComment,
  addKnowledgeRevision,
  answerKnowledgeQuestion,
  captureKnowledgeDocument,
  extractKnowledgeEntities,
  getKnowledgeSearchQualityMetrics,
  getKnowledgeIntelligenceKpis,
  listKnowledgeAttachmentIndex,
  listKnowledgeActivity,
  listKnowledgeComments,
  listKnowledgeDocuments,
  listKnowledgeRelations,
  listKnowledgeRevisions,
  listKnowledgeSharingRules,
  queueKnowledgeAttachmentIndex,
  runKnowledgeWorkflowAlpha,
  semanticKnowledgeSearch,
  searchKnowledge,
  upsertKnowledgeSharingRules,
} from "./knowledge.service.js"
import {
  knowledgeAttachmentIndexCreateSchema,
  knowledgeCommentCreateSchema,
  knowledgeEntityExtractRequest,
  knowledgeDocumentScopedQuerySchema,
  knowledgeRelationsListQuerySchema,
  knowledgeRelationCreateRequest,
  knowledgeSemanticSearchRequest,
  knowledgeSharingRulesRequestSchema,
  knowledgeRevisionCreateSchema,
  knowledgeSearchRequestSchema,
  knowledgeWorkflowAlphaRequest,
  knowledgeWorkspaceQuerySchema,
} from "./knowledge.schema.js"

function resolveTenantId(c: Context<ApiEnv>): string | null {
  const explicitHeader = c.req.header("x-tenant-id")?.trim()
  if (explicitHeader) {
    return explicitHeader
  }

  return c.get("session").tenantId
}

function ensureTenantContext(c: Context<ApiEnv>): string | Response {
  const tenantId = resolveTenantId(c)
  if (!tenantId) {
    return c.json(
      {
        code: "TENANT_CONTEXT_REQUIRED",
        message: "An active tenant context is required.",
      },
      409
    )
  }

  if (c.get("session").tenantId && tenantId !== c.get("session").tenantId) {
    return c.json(
      {
        code: "TENANT_CONTEXT_MISMATCH",
        message:
          "Reads and writes must execute against the active tenant context on the current session.",
      },
      409
    )
  }

  return tenantId
}

export const knowledgeRoutes = new Hono<ApiEnv>()
  .get(
    "/documents",
    zValidator("query", knowledgeWorkspaceQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view knowledge documents.",
          },
          403
        )
      }

      const { workspaceId } = c.req.valid("query")
      return c.json(
        success(
          await listKnowledgeDocuments({ tenantId: tenantContext, workspaceId })
        )
      )
    }
  )
  .post(
    "/capture",
    zValidator("json", knowledgeCaptureInputSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentWritePermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to capture knowledge documents.",
          },
          403
        )
      }

      const input = c.req.valid("json") as KnowledgeCaptureInput
      const record = await captureKnowledgeDocument({
        payload: input,
        tenantId: tenantContext,
        actorId: c.get("session").userId ?? "system",
        requestId: c.get("requestId"),
      })
      return c.json(success(record), 201)
    }
  )
  .post(
    "/search",
    zValidator("json", knowledgeSearchRequestSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to search knowledge documents.",
          },
          403
        )
      }

      const query = c.req.valid("json")
      return c.json(
        success(await searchKnowledge({ tenantId: tenantContext, query }))
      )
    }
  )
  .get(
    "/comments",
    zValidator("query", knowledgeDocumentScopedQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view knowledge comments.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await listKnowledgeComments({
            tenantId: tenantContext,
            workspaceId: query.workspaceId,
            documentId: query.documentId,
          })
        )
      )
    }
  )
  .post(
    "/comments",
    zValidator("json", knowledgeCommentCreateSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentWritePermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to comment on knowledge documents.",
          },
          403
        )
      }

      const payload = c.req.valid("json")
      const comment = await addKnowledgeComment({
        payload,
        tenantId: tenantContext,
        actorId: c.get("session").userId ?? "system",
        requestId: c.get("requestId"),
      })
      return c.json(success(comment), 201)
    }
  )
  .get(
    "/revisions",
    zValidator("query", knowledgeDocumentScopedQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view knowledge revisions.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await listKnowledgeRevisions({
            tenantId: tenantContext,
            workspaceId: query.workspaceId,
            documentId: query.documentId,
          })
        )
      )
    }
  )
  .post(
    "/revisions",
    zValidator("json", knowledgeRevisionCreateSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentWritePermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to revise knowledge documents.",
          },
          403
        )
      }

      const payload = c.req.valid("json")
      const revision = await addKnowledgeRevision({
        payload,
        tenantId: tenantContext,
        actorId: c.get("session").userId ?? "system",
        requestId: c.get("requestId"),
      })
      return c.json(success(revision), 201)
    }
  )
  .get(
    "/activity",
    zValidator("query", knowledgeDocumentScopedQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view knowledge activity.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await listKnowledgeActivity({
            tenantId: tenantContext,
            workspaceId: query.workspaceId,
            documentId: query.documentId,
          })
        )
      )
    }
  )
  .get(
    "/sharing-rules",
    zValidator("query", knowledgeWorkspaceQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (!authority.permissions.includes("admin:workspace:manage")) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view sharing rules.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await listKnowledgeSharingRules({ workspaceId: query.workspaceId })
        )
      )
    }
  )
  .post(
    "/sharing-rules",
    zValidator("json", knowledgeSharingRulesRequestSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (!authority.permissions.includes("admin:workspace:manage")) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to update sharing rules.",
          },
          403
        )
      }

      const payload = c.req.valid("json")
      return c.json(success(await upsertKnowledgeSharingRules({ payload })))
    }
  )
  .get(
    "/attachments/index",
    zValidator("query", knowledgeDocumentScopedQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (!authority.permissions.includes("admin:workspace:manage")) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view attachment indexing.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await listKnowledgeAttachmentIndex({
            workspaceId: query.workspaceId,
            documentId: query.documentId,
          })
        )
      )
    }
  )
  .post(
    "/attachments/index",
    zValidator("json", knowledgeAttachmentIndexCreateSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (!authority.permissions.includes("admin:workspace:manage")) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to queue attachment indexing.",
          },
          403
        )
      }

      const payload = c.req.valid("json")
      return c.json(
        success(await queueKnowledgeAttachmentIndex({ payload })),
        201
      )
    }
  )
  .get(
    "/metrics/search-quality",
    zValidator("query", knowledgeWorkspaceQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })

      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view search quality metrics.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await getKnowledgeSearchQualityMetrics({
            workspaceId: query.workspaceId,
          })
        )
      )
    }
  )
  .get(
    "/metrics/intelligence",
    zValidator("query", knowledgeWorkspaceQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })
      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view intelligence KPIs.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await getKnowledgeIntelligenceKpis({
            tenantId: tenantContext,
            workspaceId: query.workspaceId,
          })
        )
      )
    }
  )
  .post(
    "/search/semantic",
    zValidator("json", knowledgeSemanticSearchRequest),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })
      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to run semantic search.",
          },
          403
        )
      }

      const query = c.req.valid("json")
      return c.json(
        success(
          await semanticKnowledgeSearch({ tenantId: tenantContext, query })
        )
      )
    }
  )
  .post(
    "/answer",
    zValidator("json", knowledgeSemanticSearchRequest),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })
      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message: "The actor does not have permission to get cited answers.",
          },
          403
        )
      }

      const query = c.req.valid("json")
      return c.json(
        success(
          await answerKnowledgeQuestion({ tenantId: tenantContext, query })
        )
      )
    }
  )
  .get(
    "/relations",
    zValidator("query", knowledgeRelationsListQuerySchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })
      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view knowledge relations.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      return c.json(
        success(
          await listKnowledgeRelations({
            tenantId: tenantContext,
            workspaceId: query.workspaceId,
            documentId: query.documentId,
            includeSuperseded: query.includeSuperseded,
          })
        )
      )
    }
  )
  .post(
    "/relations",
    zValidator("json", knowledgeRelationCreateRequest),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })
      if (
        !authority.permissions.includes(knowledgeDocumentWritePermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to create knowledge relations.",
          },
          403
        )
      }

      const payload = c.req.valid("json")
      return c.json(
        success(
          await addKnowledgeRelation({
            payload,
            tenantId: tenantContext,
            actorId: c.get("session").userId ?? "system",
            requestId: c.get("requestId"),
          })
        ),
        201
      )
    }
  )
  .post(
    "/entities/extract",
    zValidator("json", knowledgeEntityExtractRequest),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })
      if (
        !authority.permissions.includes(knowledgeDocumentViewPermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message: "The actor does not have permission to extract entities.",
          },
          403
        )
      }

      const payload = c.req.valid("json")
      return c.json(
        success(
          await extractKnowledgeEntities({
            tenantId: tenantContext,
            payload,
            actorId: c.get("session").userId ?? "system",
            requestId: c.get("requestId"),
          })
        ),
        201
      )
    }
  )
  .post(
    "/workflow/alpha",
    zValidator("json", knowledgeWorkflowAlphaRequest),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveActorAuthorityForTenant({
        session: c.get("session"),
        tenantId: tenantContext,
        actorLabel: c.get("session").userId ?? "Afenda operator",
        requestId: c.get("requestId"),
      })
      if (
        !authority.permissions.includes(knowledgeDocumentWritePermission) &&
        !authority.permissions.includes("admin:workspace:manage")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to run workflow plugins.",
          },
          403
        )
      }

      const payload = c.req.valid("json")
      return c.json(
        success(
          await runKnowledgeWorkflowAlpha({
            payload,
            tenantId: tenantContext,
            actorId: c.get("session").userId ?? "system",
            requestId: c.get("requestId"),
          })
        ),
        201
      )
    }
  )
