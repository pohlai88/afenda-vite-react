import {
  assertUserHasTenantAccess,
  queryAuditLogs,
  type DatabaseClient,
} from "@afenda/database"
import {
  buildDomainModuleMatrix,
  getBusinessGlossarySnapshot,
  getTruthGovernanceSnapshot,
  queryAllowlistedPgEnums,
} from "@afenda/database/studio"
import type { Context } from "hono"
import type { Hono } from "hono"

function jsonWithContentEtag(
  c: Context,
  sourceContentSha256: string,
  body: unknown
) {
  const etag = `"${sourceContentSha256}"`
  if (c.req.header("if-none-match") === etag) {
    c.header("ETag", etag)
    return c.body(null, 304)
  }
  c.header("ETag", etag)
  c.header("Cache-Control", "private, max-age=120")
  return c.json(body)
}

/**
 * Read-only DB Studio routes (glossary, enum catalog, semantic matrix, recent audit).
 * Mount after `/v1/*` session middleware. Tenant-scoped audit route requires `X-Tenant-Id` + membership.
 */
export function registerStudioRoutes(
  app: Hono,
  deps: { readonly db: DatabaseClient }
): void {
  const { db } = deps

  app.get("/v1/studio/glossary", (c) => {
    const doc = getBusinessGlossarySnapshot()
    return jsonWithContentEtag(c, doc.source_content_sha256, doc)
  })

  app.get("/v1/studio/truth-governance", (c) => {
    const doc = getTruthGovernanceSnapshot()
    return jsonWithContentEtag(c, doc.source_content_sha256, doc)
  })

  app.get("/v1/studio/glossary/matrix", (c) => {
    const doc = getBusinessGlossarySnapshot()
    const matrix = buildDomainModuleMatrix(doc)
    return jsonWithContentEtag(c, doc.source_content_sha256, {
      schema_version: doc.schema_version,
      domain_modules: doc.domain_modules,
      entry_counts_by_domain_module: matrix,
    })
  })

  app.get("/v1/studio/enums", async (c) => {
    try {
      const rows = await queryAllowlistedPgEnums(db)
      return c.json({ enums: rows })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Enum query failed"
      return c.json({ error: msg }, 500)
    }
  })

  app.get("/v1/studio/audit/recent", async (c) => {
    const session = c.get("authSession")
    const tenantId = c.req.header("X-Tenant-Id")
    if (!tenantId) {
      return c.json({ error: "Missing X-Tenant-Id header" }, 400)
    }

    const allowed = await assertUserHasTenantAccess(
      db,
      session.user.id,
      tenantId
    )
    if (!allowed) {
      return c.json({ error: "Tenant not allowed for this session" }, 403)
    }

    const limitRaw = c.req.query("limit")
    const limit = Math.min(
      100,
      Math.max(1, limitRaw ? Number.parseInt(limitRaw, 10) || 50 : 50)
    )

    const rows = await queryAuditLogs(db, {
      tenantId,
      limit,
    })

    const items = JSON.parse(JSON.stringify(rows)) as Record<string, unknown>[]

    return c.json({
      tenantId,
      limit,
      items,
    })
  })
}
