import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../../app.js"
import { setBetterAuthRuntimeForTests } from "../../../api-auth-runtime.js"
import { __resetKnowledgeForTests } from "../knowledge.service.js"
import { runKnowledgeWorkflowPluginAlpha } from "@afenda/knowledge-ai"

function createRuntimeOverride(
  permissions: readonly string[] = ["admin:workspace:manage", "ops:event:view"]
) {
  return {
    auth: {
      api: {
        getSession: async () => ({
          session: {
            id: "session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
          },
        }),
      },
    } as never,
    db: null as never,
    resolveCommandAuthority: async () => ({
      roles: ["workspace_admin"],
      permissions: [...permissions],
    }),
    capabilityHooks: {
      passkeyEnabled: true,
      mfaEnabled: true,
      magicLinkEnabled: true,
      agentAuthEnabled: true,
      stepUpPolicy: "risk_based" as const,
      googleOneTapEnabled: false,
      allPluginsEnabled: true,
    },
    listTenantCandidates: async () => ({
      afendaUserId: "afenda-user-1",
      defaultTenantId: "tenant-1",
      candidates: [
        {
          tenantId: "tenant-1",
          membershipId: "membership-1",
          tenantName: "Acme Operations",
          tenantCode: "ACME",
          isDefault: true,
        },
      ],
    }),
    activateTenantContext: async () => ({
      context: {
        authProvider: "better-auth",
        authUserId: "user-1",
        authSessionId: "session-1",
        afendaUserId: "afenda-user-1",
        tenantId: "tenant-1",
        membershipId: "membership-1",
      },
      outgoingHeaders: new Headers(),
    }),
  }
}

describe("knowledge routes phase 2+3", () => {
  beforeEach(() => {
    __resetKnowledgeForTests()
    setBetterAuthRuntimeForTests(createRuntimeOverride())
  })

  it("creates comments/revisions and returns activity and search metrics", async () => {
    const app = createApp()

    const captureRes = await app.request("/api/v1/knowledge/capture", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        title: "Doc A",
        content: "phase two quality test",
        tags: ["ops"],
      }),
    })
    expect(captureRes.status).toBe(201)

    const captureBody = (await captureRes.json()) as {
      ok: boolean
      data: { id: string }
    }
    const documentId = captureBody.data.id

    const commentRes = await app.request("/api/v1/knowledge/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        documentId,
        body: "Looks good",
        mentions: ["user-2"],
      }),
    })
    expect(commentRes.status).toBe(201)

    const revisionRes = await app.request("/api/v1/knowledge/revisions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        documentId,
        summary: "Updated section 1",
      }),
    })
    expect(revisionRes.status).toBe(201)

    const activityRes = await app.request(
      `/api/v1/knowledge/activity?workspaceId=tenant-1&documentId=${encodeURIComponent(documentId)}`,
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }
    )
    expect(activityRes.status).toBe(200)
    const activityBody = (await activityRes.json()) as {
      ok: boolean
      data: Array<{ eventType: string }>
    }
    expect(activityBody.ok).toBe(true)
    expect(activityBody.data.length).toBeGreaterThan(1)

    const searchRes = await app.request("/api/v1/knowledge/search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        query: "phase",
        limit: 10,
      }),
    })
    expect(searchRes.status).toBe(200)

    const metricsRes = await app.request(
      "/api/v1/knowledge/metrics/search-quality?workspaceId=tenant-1",
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }
    )
    expect(metricsRes.status).toBe(200)
    const metricsBody = (await metricsRes.json()) as {
      ok: boolean
      data: { queryCount: number; totalResults: number }
    }
    expect(metricsBody.ok).toBe(true)
    expect(metricsBody.data.queryCount).toBeGreaterThan(0)
    expect(metricsBody.data.totalResults).toBeGreaterThan(0)
  })

  it("runs phase 3 semantic, answer, relation, entity, and workflow endpoints", async () => {
    const app = createApp()
    const captureRes = await app.request("/api/v1/knowledge/capture", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        title: "Doc Phase3",
        content: "afenda workflow relation entity extraction semantics",
        tags: ["phase3"],
      }),
    })
    expect(captureRes.status).toBe(201)
    const captureBody = (await captureRes.json()) as { data: { id: string } }
    const documentId = captureBody.data.id

    const semanticRes = await app.request("/api/v1/knowledge/search/semantic", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        query: "workflow",
        limit: 5,
      }),
    })
    expect(semanticRes.status).toBe(200)

    const answerRes = await app.request("/api/v1/knowledge/answer", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        query: "workflow",
        limit: 5,
      }),
    })
    expect(answerRes.status).toBe(200)
    const answerBody = (await answerRes.json()) as {
      ok: boolean
      data: { citations: unknown[] }
    }
    expect(answerBody.ok).toBe(true)
    expect(answerBody.data.citations.length).toBeGreaterThan(0)

    const relationRes = await app.request("/api/v1/knowledge/relations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        fromDocumentId: documentId,
        relationType: "related_to",
        toDocumentId: documentId,
        confidence: 0.9,
      }),
    })
    expect(relationRes.status).toBe(201)

    const relationsListRes = await app.request(
      `/api/v1/knowledge/relations?workspaceId=tenant-1&documentId=${encodeURIComponent(documentId)}`,
      { headers: { "x-tenant-id": "tenant-1" } }
    )
    expect(relationsListRes.status).toBe(200)

    const extractRes = await app.request("/api/v1/knowledge/entities/extract", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        documentId,
      }),
    })
    expect(extractRes.status).toBe(201)

    const workflowRes = await app.request("/api/v1/knowledge/workflow/alpha", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        documentId,
        plugin: "summary",
      }),
    })
    expect(workflowRes.status).toBe(201)

    const kpiRes = await app.request(
      "/api/v1/knowledge/metrics/intelligence?workspaceId=tenant-1",
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }
    )
    expect(kpiRes.status).toBe(200)
    const kpiBody = (await kpiRes.json()) as {
      ok: boolean
      data: {
        semanticQueryCount: number
        answerQueryCount: number
        totalCitationCount: number
        relationCount: number
        entityExtractionCount: number
        workflowRunCount: number
        indexedChunkCount: number
        lastSemanticSearchLatencyMs: number | null
        lastRetrievalMode: "semantic" | "hybrid" | "lexical_fallback" | null
      }
    }
    expect(kpiBody.ok).toBe(true)
    expect(kpiBody.data.semanticQueryCount).toBeGreaterThan(0)
    expect(kpiBody.data.answerQueryCount).toBeGreaterThan(0)
    expect(kpiBody.data.totalCitationCount).toBeGreaterThan(0)
    expect(kpiBody.data.relationCount).toBeGreaterThan(0)
    expect(kpiBody.data.entityExtractionCount).toBeGreaterThan(0)
    expect(kpiBody.data.workflowRunCount).toBeGreaterThan(0)
    expect(kpiBody.data.indexedChunkCount).toBeGreaterThan(0)
    expect(kpiBody.data.lastSemanticSearchLatencyMs).not.toBeNull()
    expect(
      kpiBody.data.lastRetrievalMode === "semantic" ||
        kpiBody.data.lastRetrievalMode === "hybrid" ||
        kpiBody.data.lastRetrievalMode === "lexical_fallback"
    ).toBe(true)
  })

  it("enforces workflow plugin boundary contracts", () => {
    expect(() =>
      runKnowledgeWorkflowPluginAlpha(
        "summary",
        {
          workspaceId: "tenant-1",
          documentId: "doc-1",
          content: "hello",
        },
        {
          summary: {
            id: "summary",
            run: () => ({
              plugin: "action-items",
              output: {},
            }),
          },
        }
      )
    ).toThrow(/mismatched output plugin id/)
  })
})

describe("knowledge intelligence negative auth/tenant", () => {
  beforeEach(() => {
    __resetKnowledgeForTests()
    setBetterAuthRuntimeForTests(createRuntimeOverride(["billing:read"]))
  })

  it("returns 403 for intelligence metrics, semantic search, and workflow when knowledge view is denied", async () => {
    const app = createApp()
    const intelligenceRes = await app.request(
      "/api/v1/knowledge/metrics/intelligence?workspaceId=tenant-1",
      { headers: { "x-tenant-id": "tenant-1" } }
    )
    expect(intelligenceRes.status).toBe(403)
    const intelligenceBody = (await intelligenceRes.json()) as { code: string }
    expect(intelligenceBody.code).toBe("FORBIDDEN")

    const semanticRes = await app.request("/api/v1/knowledge/search/semantic", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        query: "test",
        limit: 3,
      }),
    })
    expect(semanticRes.status).toBe(403)
    const semanticBody = (await semanticRes.json()) as { code: string }
    expect(semanticBody.code).toBe("FORBIDDEN")

    const workflowRes = await app.request("/api/v1/knowledge/workflow/alpha", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        workspaceId: "tenant-1",
        documentId: "doc-1",
        plugin: "summary",
      }),
    })
    expect(workflowRes.status).toBe(403)
    const workflowBody = (await workflowRes.json()) as { code: string }
    expect(workflowBody.code).toBe("FORBIDDEN")
  })

  it("returns 409 tenant mismatch when x-tenant-id disagrees with session tenant", async () => {
    __resetKnowledgeForTests()
    setBetterAuthRuntimeForTests(createRuntimeOverride())
    const app = createApp()
    const res = await app.request(
      "/api/v1/knowledge/metrics/intelligence?workspaceId=tenant-1",
      { headers: { "x-tenant-id": "tenant-2" } }
    )
    expect(res.status).toBe(409)
    const body = (await res.json()) as { code: string }
    expect(body.code).toBe("TENANT_CONTEXT_MISMATCH")
  })
})
