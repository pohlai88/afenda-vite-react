/**
 * Auth placeholder routes: reserve boundary now; wire Better Auth or session engine later.
 * Mounted at `/api/auth` — this file’s paths are relative (e.g. `/session` → `/api/auth/session`).
 * module · http · routes · auth
 * Upstream: hono, `../lib/response` `success`. Env: none.
 * Downstream: `createApp()` mounts at `/api/auth`.
 * Side effects: none.
 * Coupling: `c.get("session")` from `request-context` middleware.
 * experimental
 * @module routes/auth
 * @package @afenda/api
 */
import { Hono } from "hono"

import type { ApiEnv } from "../contract/request-context.js"
import { success } from "../lib/response.js"

/** Chained `Hono` so route schema merges for `hc<AppType>()` on the web app. */
export const authRoutes = new Hono<ApiEnv>().get("/session", (c) =>
  c.json(success(c.get("session")))
)
