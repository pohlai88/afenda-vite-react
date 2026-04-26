import type { Context } from "hono"

import type { AppMetrics, HonoMetricsMiddlewareOptions } from "./contracts"

function defaultRouteResolver(context: Context): string {
  return context.req.path || "unknown"
}

function observeHttpMetric(
  metrics: AppMetrics,
  context: Context,
  startedAtMs: number,
  route: string
): void {
  const durationSeconds = (performance.now() - startedAtMs) / 1000
  const labels = {
    method: context.req.method || "UNKNOWN",
    route,
    status_code: String(context.res.status),
    app: metrics.app,
  }

  metrics.httpRequestDuration.observe(labels, durationSeconds)
  metrics.httpRequestTotal.inc(labels)
}

export function createHonoMetricsMiddleware(
  options: HonoMetricsMiddlewareOptions
) {
  const resolveRoute = options.resolveRoute ?? defaultRouteResolver
  const shouldRecord = options.shouldRecord ?? (() => true)

  return async (context: Context, next: () => Promise<void>) => {
    const startedAt = performance.now()

    try {
      await next()
    } finally {
      if (shouldRecord(context)) {
        observeHttpMetric(
          options.metrics,
          context,
          startedAt,
          resolveRoute(context)
        )
      }
    }
  }
}
