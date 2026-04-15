import type { AfendaAuth } from "@afenda/better-auth"
import type { Pool } from "pg"
import {
  assertUserHasTenantAccess,
  IdentityLinkMissingError,
  insertGovernedAuditLog,
  requireAfendaMeContextFromBetterAuthUserId,
  type DatabaseClient,
} from "@afenda/database"
import { setSessionOperatingContext } from "@afenda/better-auth"
import { Hono } from "hono"
import { cors } from "hono/cors"

import { createAuthCompanionModuleForApp } from "./auth-companion-bootstrap.js"
import {
  registerAuthCompanionProtectedRoutes,
  registerAuthCompanionPublicRoutes,
} from "./modules/auth-companion/routes/register-auth-companion-routes.js"
import { auditContextMiddleware } from "./audit-context.js"
import { handleShellInteractionAudit } from "./shell-interaction-audit.js"
import { trustedBrowserOrigins } from "./trusted-browser-origins.js"

declare module "hono" {
  interface ContextVariableMap {
    /** Set on `/v1/*` after {@link AfendaAuth["api"]["getSession"]} succeeds. */
    authSession: NonNullable<
      Awaited<ReturnType<AfendaAuth["api"]["getSession"]>>
    >
  }
}

const DEMO_SESSION_SUBJECT = "api.demo.session"

export function createApp(db: DatabaseClient, auth: AfendaAuth, pool?: Pool) {
  const app = new Hono()
  const authCompanion = createAuthCompanionModuleForApp(db, pool)

  app.use(
    "/api/auth/*",
    cors({
      origin: trustedBrowserOrigins(),
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Cookie",
        "X-Requested-With",
      ],
      allowMethods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    })
  )

  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))

  /** Root URL (browser or curl) — avoids a bare 404 when checking the API host. */
  app.get("/", (c) =>
    c.json({
      service: "@afenda/api",
      health: "/health",
      betterAuth: "/api/auth",
      v1:
        "session required — e.g. GET /v1/me, POST /v1/session/operating-context",
    })
  )

  app.get("/health", (c) => c.json({ ok: true, service: "@afenda/api" }))

  app.use(auditContextMiddleware)

  registerAuthCompanionPublicRoutes(app, { auth, authCompanion })

  app.use("/v1/*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    c.set("authSession", session)
    await next()
  })

  registerAuthCompanionProtectedRoutes(app, { authCompanion })

  /**
   * BFF: Better Auth session + Afenda context via **`identity_links`** (no email resolution).
   */
  app.get("/v1/me", async (c) => {
    const session = c.get("authSession")
    try {
      const afenda = await requireAfendaMeContextFromBetterAuthUserId(
        db,
        session.user.id
      )
      return c.json({
        betterAuth: {
          user: session.user,
          session: session.session,
        },
        afenda,
      })
    } catch (e) {
      if (e instanceof IdentityLinkMissingError) {
        return c.json(
          {
            error: "Identity bridge required",
            code: e.code,
            details: e.details,
          },
          403
        )
      }
      throw e
    }
  })

  /**
   * Server-owned operating context (ADR-0006): validates membership, scopes, and alignment, then updates session.
   */
  app.post("/v1/session/operating-context", async (c) => {
    let body: Record<string, unknown> = {}
    try {
      body = (await c.req.json()) as Record<string, unknown>
    } catch {
      body = {}
    }
    const opt = (k: string) => {
      const v = body[k]
      if (v === null) return null
      if (typeof v === "string") return v
      return undefined
    }

    try {
      const ctx = await setSessionOperatingContext(auth, db, {
        headers: c.req.raw.headers,
        activeTenantId: opt("activeTenantId"),
        activeLegalEntityId: opt("activeLegalEntityId"),
        activeBusinessUnitId: opt("activeBusinessUnitId"),
        activeLocationId: opt("activeLocationId"),
        activeOrgUnitId: opt("activeOrgUnitId"),
      })
      return c.json({ ok: true, context: ctx })
    } catch (e) {
      if (e instanceof IdentityLinkMissingError) {
        return c.json({ error: "Identity bridge required", code: e.code }, 403)
      }
      const msg = e instanceof Error ? e.message : "Bad request"
      if (msg.includes("unauthenticated")) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      return c.json({ error: msg }, 400)
    }
  })

  /**
   * Demo audit write: requires `X-Tenant-Id` (UUID). Optional JSON body:
   * `{ "subjectId"?: string }` defaults to a stable demo id.
   */
  app.post("/v1/audit/demo", async (c) => {
    const audit = c.get("audit")
    const session = c.get("authSession")
    const tenantId = audit.tenantId
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

  app.post("/v1/audit/shell-interaction", (c) => {
    const session = c.get("authSession")
    return handleShellInteractionAudit(c, db, session.user.id)
  })

  return app
}
