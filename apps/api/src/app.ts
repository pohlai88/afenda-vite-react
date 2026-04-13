import { insertGovernedAuditLog, type DatabaseClient } from "@afenda/database"
import { Hono } from "hono"

import { auditContextMiddleware } from "./audit-context.js"

const DEMO_SESSION_SUBJECT = "api.demo.session"

export function createApp(db: DatabaseClient) {
  const app = new Hono()

  app.get("/health", (c) => c.json({ ok: true, service: "@afenda/api" }))

  app.use(auditContextMiddleware)

  /**
   * Demo audit write: requires `X-Tenant-Id` (UUID). Optional JSON body:
   * `{ "subjectId"?: string }` defaults to a stable demo id.
   */
  app.post("/v1/audit/demo", async (c) => {
    const audit = c.get("audit")
    const tenantId = audit.tenantId
    if (!tenantId) {
      return c.json({ error: "Missing X-Tenant-Id header" }, 400)
    }

    let subjectId = DEMO_SESSION_SUBJECT
    try {
      const body = await c.req.json<{ subjectId?: string }>()
      if (typeof body?.subjectId === "string" && body.subjectId.length > 0) {
        subjectId = body.subjectId
      }
    } catch {
      // empty body is fine
    }

    const row = await insertGovernedAuditLog(db, {
      tenantId,
      action: "auth.login.succeeded",
      actorType: "service",
      subjectType: "session",
      subjectId,
      sourceChannel: "api",
      outcome: "success",
      requestId: audit.requestId,
      traceId: audit.traceId,
      correlationId: audit.correlationId,
      metadata: {
        route: "/v1/audit/demo",
        module: "apps/api",
      },
    })

    return c.json({ id: row.id, recordedAt: row.recordedAt.toISOString() }, 201)
  })

  return app
}
