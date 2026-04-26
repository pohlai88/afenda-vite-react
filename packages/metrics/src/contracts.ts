import type { Context, MiddlewareHandler } from "hono"
import type {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client"

export interface MetricsOptions {
  readonly app: string
  readonly collectDefaultMetrics?: boolean
}

export interface HttpMetricLabels {
  readonly method: string
  readonly route: string
  readonly statusCode: string
  readonly app: string
}

export interface DbMetricLabels {
  readonly operation: string
  readonly model: string
  readonly app: string
}

export interface EventMetricLabels {
  readonly subject: string
  readonly type: string
  readonly app: string
}

export interface CacheMetricLabels {
  readonly operation: string
  readonly app: string
}

export interface AppMetrics {
  readonly app: string
  readonly registry: Registry
  readonly httpRequestDuration: Histogram<
    "method" | "route" | "status_code" | "app"
  >
  readonly httpRequestTotal: Counter<"method" | "route" | "status_code" | "app">
  readonly dbQueryDuration: Histogram<"operation" | "model" | "app">
  readonly eventTotal: Counter<"subject" | "type" | "app">
  readonly cacheHitTotal: Counter<"operation" | "app">
  readonly defaultMetricsCollector?: ReturnType<typeof collectDefaultMetrics>
}

export interface HonoMetricsMiddlewareOptions {
  readonly metrics: AppMetrics
  readonly resolveRoute?: (context: Context) => string
  readonly shouldRecord?: (context: Context) => boolean
}

export type MetricsHandler = () => Promise<Response>

export type MetricsRecorder = {
  readonly observeDbQueryDuration: (
    labels: Omit<DbMetricLabels, "app">,
    durationSeconds: number
  ) => void
  readonly incrementEventTotal: (
    labels: Omit<EventMetricLabels, "app">,
    count?: number
  ) => void
  readonly incrementCacheHitTotal: (
    labels: Omit<CacheMetricLabels, "app">,
    count?: number
  ) => void
  readonly middleware: MiddlewareHandler
  readonly handler: MetricsHandler
}
