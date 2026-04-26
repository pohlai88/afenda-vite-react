import { Hono } from "hono"
import { describe, expect, it } from "vitest"

import { createMetricsHandler } from "../src/handler"
import { createHonoMetricsMiddleware } from "../src/hono-middleware"
import { createAppMetrics } from "../src/create-metrics"
import {
  incrementCacheHitTotal,
  incrementEventTotal,
  observeDbQueryDuration,
} from "../src/recorders"

describe("@afenda/metrics", () => {
  it("records hono request metrics and serves prometheus text", async () => {
    const metrics = createAppMetrics({
      app: "test-app",
      collectDefaultMetrics: false,
    })

    const app = new Hono()
    app.use("*", createHonoMetricsMiddleware({ metrics }))
    app.get("/ping", (c) => c.text("pong"))

    const response = await app.request("/ping")
    expect(response.status).toBe(200)

    const metricsResponse = await createMetricsHandler(metrics)()
    const body = await metricsResponse.text()

    expect(body).toContain("http_request_duration_seconds")
    expect(body).toContain('route="/ping"')
    expect(body).toContain('app="test-app"')
  })

  it("records db, event, and cache helper metrics", async () => {
    const metrics = createAppMetrics({
      app: "test-app",
      collectDefaultMetrics: false,
    })

    observeDbQueryDuration(
      metrics,
      { operation: "select", model: "users" },
      0.02
    )
    incrementEventTotal(metrics, { subject: "ops.event", type: "publish" })
    incrementCacheHitTotal(metrics, { operation: "get" }, 2)

    const body = await metrics.registry.metrics()

    expect(body).toContain("db_query_duration_seconds")
    expect(body).toContain('model="users"')
    expect(body).toContain("event_total")
    expect(body).toContain('subject="ops.event"')
    expect(body).toContain("cache_hit_total")
    expect(body).toContain('operation="get"')
  })
})
