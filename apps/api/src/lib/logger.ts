/**
 * Structured Pino logger and request-scoped Hono logging middleware.
 * platform · observability · logging
 * Upstream: `@afenda/pino-logger`, `./env`. Downstream: app bootstrap, middleware, runtime entrypoint.
 * stable
 * @module lib/logger
 * @package @afenda/api
 */
import type { Context } from "hono"
import {
  createHonoRequestLoggingMiddleware,
  createServiceLogger,
  getRequestLogger,
} from "@afenda/pino-logger"

import { env } from "./env.js"

export const apiLogger = createServiceLogger({
  service: "@afenda/api",
  environment: env.NODE_ENV,
})

export const requestLoggingMiddleware = createHonoRequestLoggingMiddleware({
  rootLogger: apiLogger,
  getBindings: (context) => {
    const session = context.get("session")

    return {
      authenticated: session.authenticated,
      ...(session.authSessionId
        ? { authSessionId: session.authSessionId }
        : {}),
      ...(session.userId ? { userId: session.userId } : {}),
      ...(session.membershipId ? { membershipId: session.membershipId } : {}),
      ...(session.tenantId ? { tenantId: session.tenantId } : {}),
    }
  },
})

export function loggerForContext(context: Context) {
  return getRequestLogger(context, apiLogger)
}
