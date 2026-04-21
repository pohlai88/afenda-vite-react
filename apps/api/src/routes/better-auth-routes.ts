/**
 * Better Auth HTTP handler bridge.
 * Mounted at `/api/auth` and forwards the raw `Request` to Better Auth so the browser client
 * (`better-auth/react`) and server use one canonical session engine.
 *
 * @module routes/better-auth-routes
 * @package @afenda/api
 */
import { Hono } from "hono"

import type { ApiEnv } from "../contract/request-context.js"
import { getBetterAuthRuntime } from "../lib/better-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../lib/env.js"
import { failure } from "../lib/response.js"

export const betterAuthRoutes = new Hono<ApiEnv>().all("*", async (c) => {
  if (!hasBetterAuthRuntimeEnv()) {
    return c.json(
      failure({
        code: "AUTH_NOT_CONFIGURED",
        message:
          "Better Auth runtime is not configured. Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL.",
        requestId: c.get("requestId"),
      }),
      503
    )
  }

  return getBetterAuthRuntime().auth.handler(c.req.raw)
})
