import crypto from "node:crypto"

import type { Context, MiddlewareHandler } from "hono"

import type { AppLogBindings, AppLogger } from "./pino-log-contract.js"

export interface RequestLoggingOptions {
  readonly rootLogger: AppLogger
  readonly getBindings?: (context: Context) => AppLogBindings
}

export function createHonoRequestLoggingMiddleware(
  options: RequestLoggingOptions
): MiddlewareHandler {
  return async (context, next) => {
    const startedAt = performance.now()
    const requestId =
      (context.get("requestId") as string | undefined) ??
      context.req.header("x-request-id")?.trim() ??
      crypto.randomUUID()
    const traceId =
      context.req.header("x-trace-id")?.trim() ||
      (context.get("traceId") as string | undefined) ||
      requestId
    const spanId = crypto.randomUUID()

    context.set("requestId", requestId)
    context.set("traceId", traceId)
    context.set("spanId", spanId)
    context.header("x-trace-id", traceId)

    const requestLogger = options.rootLogger.child({
      requestId,
      traceId,
      spanId,
      method: context.req.method,
      path: context.req.path,
      ...(options.getBindings?.(context) ?? {}),
    })

    context.set("logger", requestLogger)

    try {
      await next()
    } finally {
      const durationMs = Number((performance.now() - startedAt).toFixed(2))
      requestLogger.info(
        {
          statusCode: context.res.status,
          durationMs,
        },
        "request completed"
      )
    }
  }
}

export function getRequestLogger(context: Context, fallback: AppLogger) {
  return (context.get("logger") as AppLogger | undefined) ?? fallback
}
