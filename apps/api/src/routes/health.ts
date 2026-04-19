/**
 * Health routes: cheap readiness/liveness surface for monitors and local smoke checks.
 * Owns HTTP shape only; does not probe databases or downstream services.
 * module · http · routes · health
 * Upstream: hono, `../lib/response` `success`. Env: none.
 * Downstream: `createApp()` mounts at `/health` (`GET /` here → `GET /health`).
 * Side effects: none (uptime/now are process clock reads).
 * Coupling: `success()` envelope `{ ok, data }` for probes and `hc` typing.
 * stable
 * @module routes/health
 * @package @afenda/api
 */
import { success } from "../lib/response.js"
import { Hono } from "hono"

/** Chained `Hono` so route schema merges for `hc<AppType>()` on the web app. */
export const healthRoutes = new Hono().get("/", (c) =>
  c.json(
    success({
      service: "@afenda/api",
      status: "ok",
      now: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    })
  )
)
