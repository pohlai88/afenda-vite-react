/**
 * Canonical Hono app composition.
 * - Hono owns HTTP concerns
 * - route trees mounted once
 * - shared typed contract exported to frontend
 *
 * @module app
 */
import type { ApiEnv } from "./contract/request-context.js"
import { failure, success } from "./contract/envelope.js"
import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"

import apiPackage from "../package.json" with { type: "json" }

import { env } from "./lib/env.js"
import { requestLoggingMiddleware } from "./lib/logger.js"
import { betterAuthSessionContextMiddleware } from "./middleware/better-auth-session-context.js"
import { onError, onNotFound } from "./middleware/error-handler.js"
import { requestContextMiddleware } from "./middleware/request-context.js"
import { authCompanionRoutes } from "./routes/auth-companion-routes.js"
import { betterAuthRoutes } from "./routes/better-auth-routes.js"
import { healthRoutes } from "./routes/health.js"
import { userRoutes } from "./routes/users.js"

export type { ApiEnv, AppVariables } from "./contract/request-context.js"

export function createApp() {
  const app = new Hono<ApiEnv>()

  app.onError(onError)
  app.notFound(onNotFound)

  app.use("*", requestContextMiddleware)
  app.use("/api/*", betterAuthSessionContextMiddleware)
  app.use("*", requestLoggingMiddleware)
  app.use("*", secureHeaders())

  app.use(
    "/api/*",
    cors({
      origin: env.WEB_ORIGIN,
      allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["X-Request-Id"],
      credentials: true,
      maxAge: 86400,
    })
  )

  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 2 * 1024 * 1024,
      onError: (c) =>
        c.json(
          failure({
            code: "BAD_REQUEST",
            message: "Request body exceeds the configured limit.",
            requestId: c.get("requestId"),
          }),
          413
        ),
    })
  )

  app.get("/", (c) =>
    c.json(
      success({
        service: "@afenda/api",
        runtime: "node",
        version: apiPackage.version,
      })
    )
  )

  app.route("/health", healthRoutes)
  app.route("/api/auth", betterAuthRoutes)
  app.route("/api/v1/auth", authCompanionRoutes)
  app.route("/api/users", userRoutes)

  return app
}

/** Hono RPC client (`hc<AppType>()`) — share with `apps/web` via `import type`. */
export type AppType = ReturnType<typeof createApp>
