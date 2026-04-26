import { Hono } from "hono"

import { apiHealthManager } from "./api-health-manager.js"
import { success } from "./api-response.js"

/** Chained `Hono` so route schema merges for `hc<AppType>()` on the web app. */
export const healthRoutes = new Hono()
  .get("/", async (c) => {
    const report = await apiHealthManager.getHealth()
    const statusCode = report.status === "unhealthy" ? 503 : 200

    return c.json(success(report), statusCode)
  })
  .get("/live", async (c) => {
    const result = await apiHealthManager.getLiveness()
    const statusCode = result.status === "ok" ? 200 : 503

    return c.json(success(result), statusCode)
  })
  .get("/ready", async (c) => {
    const result = await apiHealthManager.getReadiness()
    const statusCode = result.status === "ok" ? 200 : 503

    return c.json(success(result), statusCode)
  })
  .get("/startup", async (c) => {
    const result = await apiHealthManager.getStartup()
    const statusCode = result.status === "ok" ? 200 : 503

    return c.json(success(result), statusCode)
  })
  .get("/version", async (c) =>
    c.json(success(await apiHealthManager.getVersion()))
  )
