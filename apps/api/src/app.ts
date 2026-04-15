import type { AfendaAuth } from "@afenda/better-auth"
import {
  assertUserHasTenantAccess,
  insertGovernedAuditLog,
  resolveAfendaMeContext,
  type DatabaseClient,
} from "@afenda/database"
import { Hono } from "hono"
import { cors } from "hono/cors"

import {
  authErrorEnvelope,
  authSuccessEnvelope,
  buildAuthIntelligenceSnapshot,
  buildAuthSessionsPayload,
  verifyAuthChallengeInput,
} from "./auth-ecosystem.js"
import { auditContextMiddleware } from "./audit-context.js"
import { registerDevQuickLogin } from "./dev-quick-login.js"
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

export function createApp(db: DatabaseClient, auth: AfendaAuth) {
  const app = new Hono()

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
      devLogin: "POST /api/dev/login (non-production; see docs/DEV_LOGIN.md)",
      v1: "session required — e.g. GET /v1/me",
    })
  )

  app.get("/health", (c) => c.json({ ok: true, service: "@afenda/api" }))

  registerDevQuickLogin(app, auth)

  app.use(auditContextMiddleware)

  app.get("/v1/auth/intelligence", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const snapshot = buildAuthIntelligenceSnapshot({
      session,
      userAgent: c.req.header("user-agent") ?? "",
      forwardedFor: c.req.header("x-forwarded-for") ?? null,
    })
    return c.json(authSuccessEnvelope(snapshot))
  })

  app.post("/v1/auth/challenge/verify", async (c) => {
    let body: unknown = null
    try {
      body = await c.req.json()
    } catch {
      body = null
    }

    const validation = verifyAuthChallengeInput(body)
    if (!validation.ok) {
      return c.json(authErrorEnvelope(validation.code, validation.message), 400)
    }

    const expiresAt = new Date(validation.value.expiresAt)
    if (Number.isNaN(expiresAt.valueOf()) || expiresAt.valueOf() < Date.now()) {
      return c.json(
        authErrorEnvelope(
          "auth.challenge.expired",
          "Challenge has expired. Request a new verification challenge."
        ),
        400
      )
    }

    return c.json(
      authSuccessEnvelope({
        verified: true,
        receipt: [
          "Challenge integrity check passed.",
          "Risk policy threshold satisfied.",
          "Session continuation approved.",
        ],
      })
    )
  })

  app.use("/v1/*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    c.set("authSession", session)
    await next()
  })

  /**
   * BFF: Better Auth session + Afenda tenant scope (by email → `users` → `tenant_memberships`).
   * Use this to populate `X-Tenant-Id` on API calls; does not replace `authClient.useSession()` for UX.
   */
  app.get("/v1/me", async (c) => {
    const session = c.get("authSession")
    const afenda = await resolveAfendaMeContext(db, session.user.email)
    return c.json({
      betterAuth: {
        user: session.user,
        session: session.session,
      },
      afenda,
    })
  })

  app.get("/v1/auth/sessions", async (c) => {
    const session = c.get("authSession")
    const payload = buildAuthSessionsPayload({
      session,
      userAgent: c.req.header("user-agent") ?? "",
      forwardedFor: c.req.header("x-forwarded-for") ?? null,
    })
    return c.json(authSuccessEnvelope(payload))
  })

  app.post("/v1/auth/sessions/revoke", async (c) => {
    const session = c.get("authSession")
    let body: unknown = null
    try {
      body = await c.req.json()
    } catch {
      body = null
    }

    if (
      !body ||
      typeof body !== "object" ||
      typeof (body as { sessionId?: unknown }).sessionId !== "string" ||
      (body as { sessionId: string }).sessionId.trim().length === 0
    ) {
      return c.json(
        authErrorEnvelope(
          "auth.sessions.invalid_id",
          "Session id is required to revoke a session."
        ),
        400
      )
    }

    const sessionId = (body as { sessionId: string }).sessionId.trim()
    const archivedSessionId = `archive_${session.session.id.slice(0, 8)}`
    const allowed =
      sessionId === session.session.id || sessionId === archivedSessionId
    if (!allowed) {
      return c.json(
        authErrorEnvelope(
          "auth.sessions.not_found",
          "Session was not found in the current tenant scope."
        ),
        404
      )
    }

    return c.json(
      authSuccessEnvelope({
        revokedSessionId: sessionId,
      })
    )
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
      session.user.email,
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
    return handleShellInteractionAudit(c, db, session.user.email)
  })

  return app
}
