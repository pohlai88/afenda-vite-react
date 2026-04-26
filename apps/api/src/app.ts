/**
 * Canonical Hono app composition.
 * - Hono owns HTTP concerns
 * - route trees mounted once
 * - shared typed contract exported to frontend
 *
 * @module app
 */
import type { ApiEnv } from "./contract/request-context.contract.js"
import { failure, success } from "./contract/http-envelope.contract.js"
import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"

import apiPackage from "../package.json" with { type: "json" }

import { authCompanionRoutes } from "./api-auth-companion.routes.js"
import { markApiHealthReady } from "./api-health-manager.js"
import { betterAuthSessionContextMiddleware } from "./api-auth-session.middleware.js"
import { betterAuthRoutes } from "./api-better-auth.routes.js"
import { env } from "./api-env.js"
import { onError, onNotFound } from "./api-error-handler.middleware.js"
import { healthRoutes } from "./api-health.routes.js"
import { requestLoggingMiddleware } from "./api-logger.js"
import { metricsHandler, metricsMiddleware } from "./api-metrics.js"
import { meRoutes } from "./api-me.routes.js"
import { requestContextMiddleware } from "./api-request-context.middleware.js"
import { commandsRoutes } from "./command/command-execution.routes.js"
import { financeRoutes } from "./modules/finance/index.js"
import { knowledgeRoutes } from "./modules/knowledge/knowledge.routes.js"
import { legacyErpRoutes } from "./modules/legacy-erp/legacy-erp.routes.js"
import { mdmRoutes } from "./modules/mdm/mdm.routes.js"
import { operationsRoutes } from "./modules/operations/operations.routes.js"
import { userRoutes } from "./modules/users/user.routes.js"

export type {
  ApiEnv,
  AppVariables,
} from "./contract/request-context.contract.js"

function buildApp() {
  markApiHealthReady()

  return new Hono<ApiEnv>()
    .onError(onError)
    .notFound(onNotFound)
    .use("*", requestContextMiddleware)
    .use("*", metricsMiddleware)
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
    .get("/metrics", () => metricsHandler())
    .route("/health", healthRoutes)
    .route("/api/auth", betterAuthRoutes)
    .route("/api/v1/auth", authCompanionRoutes)
    .route("/api/v1/commands", commandsRoutes)
    .route("/api/v1/finance", financeRoutes)
    .route("/api/v1/knowledge", knowledgeRoutes)
    .route("/api/v1/legacy-erp", legacyErpRoutes)
    .route("/api/v1/mdm", mdmRoutes)
    .route("/api/v1/me", meRoutes)
    .route("/api/v1/ops", operationsRoutes)
    .route("/api/users", userRoutes)
}

export function createApp() {
  return buildApp()
}

/** Hono RPC client (`hc<AppType>()`) — share with `apps/web` via `import type`. */
export type AppType = ReturnType<typeof buildApp>
