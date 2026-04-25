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
import { commandsRoutes } from "./routes/commands.js"
import { healthRoutes } from "./routes/health.js"
import { meRoutes } from "./routes/me.js"
import { operationsRoutes } from "./routes/operations.js"
import { userRoutes } from "./routes/users.js"

export type { ApiEnv, AppVariables } from "./contract/request-context.js"

function buildApp() {
  return new Hono<ApiEnv>()
    .onError(onError)
    .notFound(onNotFound)
    .use("*", requestContextMiddleware)
    .use("/api/*", betterAuthSessionContextMiddleware)
    .use("*", requestLoggingMiddleware)
    .use("*", secureHeaders())
    .use(
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
    .use(
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
    .get("/", (c) =>
      c.json(
        success({
          service: "@afenda/api",
          runtime: "node",
          version: apiPackage.version,
        })
      )
    )
    .route("/health", healthRoutes)
    .route("/api/auth", betterAuthRoutes)
    .route("/api/v1/auth", authCompanionRoutes)
    .route("/api/v1/commands", commandsRoutes)
    .route("/api/v1/me", meRoutes)
    .route("/api/v1/ops", operationsRoutes)
    .route("/api/users", userRoutes)
}

const app = buildApp()

export function createApp() {
  return buildApp()
}

/** Hono RPC client (`hc<AppType>()`) — share with `apps/web` via `import type`. */
export type AppType = typeof app
