import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client"

import type { AppMetrics, MetricsOptions } from "./contracts"

export function createAppMetrics(options: MetricsOptions): AppMetrics {
  const registry = new Registry()
  const defaultMetricsCollector =
    options.collectDefaultMetrics === false
      ? undefined
      : collectDefaultMetrics({ register: registry })

  return {
    app: options.app,
    registry,
    defaultMetricsCollector,
    httpRequestDuration: new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code", "app"],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [registry],
    }),
    httpRequestTotal: new Counter({
      name: "http_request_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code", "app"],
      registers: [registry],
    }),
    dbQueryDuration: new Histogram({
      name: "db_query_duration_seconds",
      help: "Duration of database queries in seconds",
      labelNames: ["operation", "model", "app"],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [registry],
    }),
    eventTotal: new Counter({
      name: "event_total",
      help: "Total number of processed events",
      labelNames: ["subject", "type", "app"],
      registers: [registry],
    }),
    cacheHitTotal: new Counter({
      name: "cache_hit_total",
      help: "Total number of cache hits",
      labelNames: ["operation", "app"],
      registers: [registry],
    }),
  }
}
