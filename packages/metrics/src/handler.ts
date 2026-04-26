import type { AppMetrics } from "./contracts"

export function createMetricsHandler(metrics: AppMetrics) {
  return async () =>
    new Response(await metrics.registry.metrics(), {
      status: 200,
      headers: {
        "content-type": metrics.registry.contentType,
      },
    })
}
