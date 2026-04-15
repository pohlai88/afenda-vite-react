import type { AfendaAuth } from "@afenda/better-auth"
import type { Hono } from "hono"
import { cors } from "hono/cors"

import { trustedBrowserOrigins } from "./trusted-browser-origins.js"

const NOT_CONFIGURED_MESSAGE =
  "Dev quick login is not configured on the API. Set AFENDA_DEV_LOGIN_ENABLED=true, AFENDA_DEV_LOGIN_EMAIL, and AFENDA_DEV_LOGIN_PASSWORD (see docs/DEV_LOGIN.md)."

/**
 * One-click dev login: server-side `signInEmail` using credentials from **server env only**
 * (`AFENDA_DEV_LOGIN_EMAIL` / `AFENDA_DEV_LOGIN_PASSWORD`). Never enabled in production builds.
 *
 * Optional `AFENDA_DEV_LOGIN_SECRET`: if set, request must send the same value in
 * `X-Afenda-Dev-Login-Secret`.
 *
 * The route is **always** registered in non-production so clients get JSON + 503 instead of a bare 404
 * when env is incomplete.
 */
export function registerDevQuickLogin(app: Hono, auth: AfendaAuth): void {
  if (process.env.NODE_ENV === "production") {
    return
  }

  const email = process.env.AFENDA_DEV_LOGIN_EMAIL?.trim()
  const password = process.env.AFENDA_DEV_LOGIN_PASSWORD
  const enabled = process.env.AFENDA_DEV_LOGIN_ENABLED === "true"
  const optionalSecret = process.env.AFENDA_DEV_LOGIN_SECRET?.trim()

  const configured =
    enabled && Boolean(email) && password !== undefined && password !== ""

  if (enabled && !configured) {
    console.warn(
      "[afenda/api] AFENDA_DEV_LOGIN_ENABLED=true but AFENDA_DEV_LOGIN_EMAIL or AFENDA_DEV_LOGIN_PASSWORD is missing — POST /api/dev/login returns 503 until set."
    )
  }

  app.use(
    "/api/dev/login",
    cors({
      origin: trustedBrowserOrigins(),
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Cookie",
        "X-Requested-With",
        "X-Afenda-Dev-Login-Secret",
      ],
      allowMethods: ["POST", "OPTIONS"],
      credentials: true,
    })
  )

  app.post("/api/dev/login", async (c) => {
    if (!configured) {
      return c.json({ error: NOT_CONFIGURED_MESSAGE }, 503)
    }

    const origin = c.req.header("origin") ?? ""
    const allowed = trustedBrowserOrigins()
    if (origin !== "" && !allowed.includes(origin)) {
      return c.json({ error: "Origin not allowed for dev login" }, 403)
    }

    if (optionalSecret !== undefined && optionalSecret !== "") {
      const headerSecret = c.req.header("x-afenda-dev-login-secret")
      if (headerSecret !== optionalSecret) {
        return c.json({ error: "Invalid or missing dev login secret" }, 401)
      }
    }

    try {
      const response = await auth.api.signInEmail({
        body: { email: email!, password: password! },
        headers: c.req.raw.headers,
        asResponse: true,
      })
      return response
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      if (typeof err.message === "string") {
        const code =
          typeof err.status === "number" &&
          err.status >= 400 &&
          err.status < 600
            ? err.status
            : 401
        return new Response(JSON.stringify({ error: err.message }), {
          status: code,
          headers: { "content-type": "application/json" },
        })
      }
      throw e
    }
  })
}
