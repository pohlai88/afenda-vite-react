import type { AppMetrics } from "./contracts"

export function observeDbQueryDuration(
  metrics: AppMetrics,
  labels: { readonly operation: string; readonly model: string },
  durationSeconds: number
): void {
  metrics.dbQueryDuration.observe(
    {
      operation: labels.operation,
      model: labels.model,
      app: metrics.app,
    },
    durationSeconds
  )
}

export function incrementEventTotal(
  metrics: AppMetrics,
  labels: { readonly subject: string; readonly type: string },
  count = 1
): void {
  metrics.eventTotal.inc(
    {
      subject: labels.subject,
      type: labels.type,
      app: metrics.app,
    },
    count
  )
}

export function incrementCacheHitTotal(
  metrics: AppMetrics,
  labels: { readonly operation: string },
  count = 1
): void {
  metrics.cacheHitTotal.inc(
    {
      operation: labels.operation,
      app: metrics.app,
    },
    count
  )
}
