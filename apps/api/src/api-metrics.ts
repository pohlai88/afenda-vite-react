import {
  createAppMetrics,
  createHonoMetricsMiddleware,
  createMetricsHandler,
  type MetricsHandler,
} from "@afenda/metrics"

export const apiMetrics = createAppMetrics({
  app: "@afenda/api",
})

export const metricsMiddleware = createHonoMetricsMiddleware({
  metrics: apiMetrics,
  resolveRoute: (context) => context.req.path,
})

export const metricsHandler: MetricsHandler = createMetricsHandler(apiMetrics)
