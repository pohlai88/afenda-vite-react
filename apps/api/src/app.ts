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
import { Hono, type Context } from "hono"
import { cors } from "hono/cors"

import { createAuthCompanionModuleForApp } from "./auth-companion-bootstrap.js"
import {
  registerAuthCompanionProtectedRoutes,
  registerAuthCompanionPublicRoutes,
} from "./modules/auth-companion/routes/register-auth-companion-routes.js"
import { auditContextMiddleware } from "./audit-context.js"
import { handleShellInteractionAudit } from "./shell-interaction-audit.js"
import { registerStudioRoutes } from "./modules/studio/register-studio-routes.js"
import { trustedBrowserOrigins } from "./trusted-browser-origins.js"

declare module "hono" {
  interface ContextVariableMap {
    /** Set on `/v1/*` after {@link AfendaAuth["api"]["getSession"]} succeeds. */
    authSession: NonNullable<
      Awaited<ReturnType<AfendaAuth["api"]["getSession"]>>
    >
  }
}

/** Default `subjectId` for the exploratory `/v1/audit/demo` route when the body omits one. */
const DEFAULT_AUDIT_DEMO_SUBJECT_ID = "api.audit.demo.default-subject"

/** Forward Better Auth `auth.api.*` response headers (notably multiple `Set-Cookie`) onto a Hono response. */
function applyBetterAuthOutgoingHeaders(c: Context, outgoing: Headers): void {
  const setCookies =
    typeof outgoing.getSetCookie === "function" ? outgoing.getSetCookie() : null

  outgoing.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return
    }
    c.header(key, value)
  })

  if (setCookies && setCookies.length > 0) {
    for (const cookie of setCookies) {
      c.header("Set-Cookie", cookie, { append: true })
    }
  } else {
    outgoing.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        c.header(key, value, { append: true })
      }
    })
  }
}

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

  /** Ops probe — not part of Better Auth’s own routes; documents `auth.handler` wiring. */
  app.get("/api/auth/ok", (c) =>
    c.json({ ok: true, betterAuthMounted: true, service: "@afenda/api" })
  )

  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))

  /** Root URL (browser or curl) — avoids a bare 404 when checking the API host. */
  app.get("/", (c) =>
    c.json({
      service: "@afenda/api",
      health: "/health",
      betterAuth: "/api/auth",
      v1: "session required — e.g. GET /v1/me, POST /v1/session/operating-context",
      studio:
        "session required — GET /v1/studio/glossary | /v1/studio/glossary/matrix | /v1/studio/truth-governance | /v1/studio/enums | /v1/studio/audit/recent (needs X-Tenant-Id)",
    })
  )

  app.get("/health", (c) => c.json({ ok: true, service: "@afenda/api" }))

  /**
   * Agent Auth discovery — https://better-auth.com/docs/plugins/agent-auth
   * Proxied from Vite dev (`/.well-known/...` → API). Requires `AFENDA_AUTH_AGENT_AUTH_ENABLED=true`.
   */
  app.get("/.well-known/agent-configuration", async (c) => {
    c.header("Access-Control-Allow-Origin", "*")
    const getConfiguration = (
      auth.api as {
        getAgentConfiguration?: () => Promise<unknown>
      }
    ).getAgentConfiguration
    if (typeof getConfiguration !== "function") {
      return c.json({ error: "Agent Auth is not enabled" }, 404)
    }
    const configuration = await getConfiguration()
    return c.json(configuration)
  })

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

  /** Server-owned operating context: validates active tenant membership, then updates session. */
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
      const { context, outgoingHeaders } = await setSessionOperatingContext(
        auth,
        db,
        {
          headers: c.req.raw.headers,
          activeTenantId: opt("activeTenantId"),
        }
      )
      applyBetterAuthOutgoingHeaders(c, outgoingHeaders)
      return c.json({ ok: true, context })
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
   * `{ "subjectId"?: string }` may be omitted; a built-in default subject id is used.
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

    let subjectId = DEFAULT_AUDIT_DEMO_SUBJECT_ID
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

  registerStudioRoutes(app, { db })

  return app
}
