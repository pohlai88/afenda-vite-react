import type { AfendaAuth } from "@afenda/better-auth"
import type { Hono } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

import type { AuthCompanionModule } from "../create-auth-companion-module.js"
import { runWithAuthSessionContext } from "../utils/auth-request-context.js"

type HttpApp = {
  get: (path: string, handler: unknown) => void
  post: (path: string, handler: unknown) => void
}

/**
 * Framework-agnostic registration (paths include `/api` prefix).
 * The Vite dev proxy maps browser `/api/v1/*` to this API’s `/v1/*` — prefer
 * {@link registerAuthCompanionHonoRoutes} for the Hono app.
 */
export function registerAuthCompanionRoutes(
  app: HttpApp,
  routes: AuthCompanionModule["routes"]
): void {
  app.get("/api/v1/auth/intelligence", routes.intelligenceRoutes.getSnapshot)
  app.get("/api/v1/auth/sessions", routes.sessionRoutes.list)
  app.post("/api/v1/auth/sessions/revoke", routes.sessionRoutes.revoke)
  app.post("/api/v1/auth/challenge/start", routes.challengeRoutes.start)
  app.post("/api/v1/auth/challenge/verify", routes.challengeRoutes.verify)
}

export type RegisterAuthCompanionHonoDeps = {
  readonly auth: AfendaAuth
  readonly authCompanion: AuthCompanionModule
}

/**
 * Guest-safe auth companion routes (Better Auth session optional).
 * Mount **before** `/v1/*` session gate middleware.
 */
export function registerAuthCompanionPublicRoutes(
  app: Hono,
  deps: RegisterAuthCompanionHonoDeps
): void {
  const { intelligenceRoutes, challengeRoutes } = deps.authCompanion.routes

  app.get("/v1/auth/intelligence", async (c) => {
    const session = await deps.auth.api.getSession({
      headers: c.req.raw.headers,
    })
    const result = await intelligenceRoutes.getSnapshot({
      requestId: c.req.header("x-request-id") ?? undefined,
      actorUserId: session?.user.id ?? null,
      session: session ?? null,
      ipAddress: c.req.header("x-forwarded-for") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
    })
    return c.json(result.body, result.status as ContentfulStatusCode)
  })

  app.post("/v1/auth/challenge/start", async (c) => {
    const session = await deps.auth.api.getSession({
      headers: c.req.raw.headers,
    })
    let body: unknown = null
    try {
      body = await c.req.json()
    } catch {
      body = null
    }
    const result = await challengeRoutes.start({
      body,
      requestId: c.req.header("x-request-id") ?? undefined,
      actorUserId: session?.user.id ?? null,
      ipAddress: c.req.header("x-forwarded-for") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
    })
    return c.json(result.body, result.status as ContentfulStatusCode)
  })

  app.post("/v1/auth/challenge/verify", async (c) => {
    let body: unknown = null
    try {
      body = await c.req.json()
    } catch {
      body = null
    }
    const result = await challengeRoutes.verify({
      body,
      requestId: c.req.header("x-request-id") ?? undefined,
    })
    return c.json(result.body, result.status as ContentfulStatusCode)
  })
}

/**
 * Session-backed auth companion routes.
 * Mount **after** `/v1/*` middleware sets `authSession`.
 */
export function registerAuthCompanionProtectedRoutes(
  app: Hono,
  deps: Pick<RegisterAuthCompanionHonoDeps, "authCompanion">
): void {
  const { sessionRoutes } = deps.authCompanion.routes

  app.get("/v1/auth/sessions", async (c) => {
    const session = c.get("authSession")
    return await runWithAuthSessionContext(
      {
        session,
        userAgent: c.req.header("user-agent") ?? "",
        forwardedFor: c.req.header("x-forwarded-for") ?? null,
      },
      async () => {
        const result = await sessionRoutes.list({
          requestId: c.req.header("x-request-id") ?? undefined,
          actorUserId: session.user.id,
          currentSessionId: session.session.id,
        })
        return c.json(result.body, result.status as ContentfulStatusCode)
      }
    )
  })

  app.post("/v1/auth/sessions/revoke", async (c) => {
    const session = c.get("authSession")
    let body: unknown = null
    try {
      body = await c.req.json()
    } catch {
      body = null
    }
    return await runWithAuthSessionContext(
      {
        session,
        userAgent: c.req.header("user-agent") ?? "",
        forwardedFor: c.req.header("x-forwarded-for") ?? null,
      },
      async () => {
        const result = await sessionRoutes.revoke({
          body,
          requestId: c.req.header("x-request-id") ?? undefined,
          actorUserId: session.user.id,
        })
        return c.json(result.body, result.status as ContentfulStatusCode)
      }
    )
  })
}
