/**
 * Transport error mapping: `AppError` / `HTTPException` / `ZodError` → `failure()` JSON; unknown → 500.
 * Owns HTTP status + envelope only; domain rules live in modules / route validators.
 * platform · http · middleware · errors
 * Upstream: hono, hono/http-exception, zod. Env: none.
 * Downstream: `app.onError` / `app.notFound` in `app.ts` (or `registerErrorHandler`).
 * Side effects: request-scoped structured error log on unhandled path (`lib/logger`).
 * Coupling: `lib/response` `failure()`; `c.get("requestId")` from `request-context` middleware.
 * stable
 * @module middleware/error-handler
 * @package @afenda/api
 */
import type { Context } from "hono"
import type { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { HTTPResponseError } from "hono/types"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { ZodError } from "zod"

import { AppError } from "../lib/errors.js"
import { loggerForContext } from "../lib/logger.js"
import { failure } from "../lib/response.js"

const GENERIC_5XX_MESSAGE = "An unexpected error occurred."

function httpStatusToErrorCode(status: number): string {
  const table: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
  }
  return table[status] ?? `HTTP_${status}`
}

function normalizeHttpStatus(status: unknown): ContentfulStatusCode {
  if (
    typeof status === "number" &&
    Number.isInteger(status) &&
    status >= 400 &&
    status <= 599
  ) {
    return status as ContentfulStatusCode
  }
  return 500
}

function getRequestId(c: Context): string | undefined {
  return c.get("requestId") as string | undefined
}

export function onError(error: Error | HTTPResponseError, c: Context) {
  const requestId = getRequestId(c)

  if (error instanceof AppError) {
    return c.json(
      failure({
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      }),
      error.status as ContentfulStatusCode
    )
  }

  if (error instanceof HTTPException) {
    const status = normalizeHttpStatus(error.status)
    const code = httpStatusToErrorCode(status)
    const clientMessage =
      status >= 500
        ? GENERIC_5XX_MESSAGE
        : error.message?.trim() || "Request failed."
    return c.json(
      failure({
        code,
        message: clientMessage,
        requestId,
      }),
      status
    )
  }

  if (error instanceof ZodError) {
    return c.json(
      failure({
        code: "BAD_REQUEST",
        message: "Request validation failed.",
        details: error.flatten(),
        requestId,
      }),
      400
    )
  }

  loggerForContext(c).error(
    {
      requestId,
      path: c.req.path,
      method: c.req.method,
      error: error.message,
    },
    "unhandled api error"
  )

  return c.json(
    failure({
      code: "INTERNAL_SERVER_ERROR",
      message: GENERIC_5XX_MESSAGE,
      requestId,
    }),
    500
  )
}

export function notFound(c: Context) {
  return c.json(
    failure({
      code: "NOT_FOUND",
      message: `Route not found: ${c.req.method} ${c.req.path}`,
      requestId: c.get("requestId"),
    }),
    404
  )
}

/** Alias matching the monorepo pack naming (`app.notFound(onNotFound)`). */
export const onNotFound = notFound

export function registerErrorHandler(app: Hono) {
  app.onError(onError)
  app.notFound(notFound)
}
