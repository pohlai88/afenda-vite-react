/**
 * Structured JSON logs to stdout (application events). Complements Hono’s `logger()` middleware
 * (`hono/logger`), which prints request/response lines — see https://hono.dev/docs/middleware/builtin/logger
 * platform · observability · logging
 * Upstream: none. Downstream: services, route handlers, middleware.
 * Side effects: writes to `console` only.
 * stable
 * @module lib/logger
 * @package @afenda/api
 */

export type LogLevel = "info" | "warn" | "error"

export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  const payload = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  }

  if (level === "error") {
    console.error(JSON.stringify(payload))
    return
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload))
    return
  }

  console.log(JSON.stringify(payload))
}
