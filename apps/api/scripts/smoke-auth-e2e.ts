/**
 * In-process smoke checks for Better Auth + auth companion (no HTTP server).
 *
 * Requires repo-root `.env` (via loadMonorepoEnvLayered): DATABASE_URL, BETTER_AUTH_SECRET,
 * BETTER_AUTH_URL (optional).
 *
 * Checks:
 * - GET /health
 * - GET /v1/auth/intelligence (guest snapshot)
 * - POST /v1/auth/challenge/start + /verify (TOTP path; dev OTP logged)
 *
 * Optional:
 * - SMOKE_SESSION_COOKIE — raw `Cookie` header value from the browser after sign-in
 *   (DevTools → Network → copy request headers). If set, also GET /v1/auth/sessions.
 *
 * Run from repo root:
 *   pnpm --filter @afenda/api run smoke:auth
 */
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

loadMonorepoEnvLayered()

import { createAfendaAuth } from "@afenda/better-auth"
import { createDbClient, createPgPool } from "@afenda/database"

import { createApp } from "../src/app.js"

function fail(message: string): never {
  console.error(`[smoke:auth] ${message}`)
  process.exit(1)
}

async function main(): Promise<void> {
  if (!process.env.BETTER_AUTH_SECRET) {
    fail("BETTER_AUTH_SECRET is required")
  }
  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL is required")
  }

  const pool = createPgPool()
  const db = createDbClient(pool)
  const auth = createAfendaAuth(pool, db)
  const app = createApp(db, auth, pool)

  const base = "http://smoke.test"

  const health = await app.request(`${base}/health`)
  if (health.status !== 200) {
    fail(`GET /health expected 200, got ${health.status}`)
  }
  console.info("[smoke:auth] GET /health ok")

  const intel = await app.request(`${base}/v1/auth/intelligence`, {
    headers: { "user-agent": "smoke-auth-e2e" },
  })
  if (intel.status !== 200) {
    fail(`GET /v1/auth/intelligence expected 200, got ${intel.status}`)
  }
  const intelJson = (await intel.json()) as {
    data?: { trustLevel?: string; score?: number }
  }
  if (
    typeof intelJson.data?.trustLevel !== "string" ||
    typeof intelJson.data?.score !== "number"
  ) {
    fail(
      `GET /v1/auth/intelligence unexpected body: ${JSON.stringify(intelJson)}`
    )
  }
  console.info(
    `[smoke:auth] GET /v1/auth/intelligence ok (trustLevel=${intelJson.data.trustLevel}, score=${intelJson.data.score})`
  )

  let otpLine = ""
  const origInfo = console.info.bind(console)
  console.info = (...args: unknown[]) => {
    otpLine = args.map(String).join(" ")
    origInfo(...args)
  }

  const start = await app.request(`${base}/v1/auth/challenge/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "smoke-e2e@example.local",
      method: "totp",
    }),
  })
  console.info = origInfo

  if (start.status !== 200) {
    const t = await start.text()
    fail(
      `POST /v1/auth/challenge/start expected 200, got ${start.status}: ${t}`
    )
  }
  const started = (await start.json()) as {
    data?: { ticket?: { challengeId?: string } }
  }
  const challengeId = started.data?.ticket?.challengeId
  if (!challengeId) {
    fail(`challenge start missing ticket: ${JSON.stringify(started)}`)
  }
  const otpMatch = otpLine.match(/: (\d{6})\s*$/)
  const code = otpMatch?.[1]
  if (!code) {
    fail(
      "could not capture dev OTP from console (expected [afenda/auth-challenge] log line)"
    )
  }

  const verify = await app.request(`${base}/v1/auth/challenge/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      challengeId,
      method: "totp",
      proof: { code },
    }),
  })
  if (verify.status !== 200) {
    const t = await verify.text()
    fail(
      `POST /v1/auth/challenge/verify expected 200, got ${verify.status}: ${t}`
    )
  }
  const verified = (await verify.json()) as { data?: { verified?: boolean } }
  if (!verified.data?.verified) {
    fail(`challenge verify not verified: ${JSON.stringify(verified)}`)
  }
  console.info("[smoke:auth] challenge start + verify (totp) ok")

  const cookie = process.env.SMOKE_SESSION_COOKIE?.trim()
  if (cookie) {
    const sessions = await app.request(`${base}/v1/auth/sessions`, {
      headers: {
        cookie,
        "user-agent": "smoke-auth-e2e",
      },
    })
    if (sessions.status !== 200) {
      const t = await sessions.text()
      fail(
        `GET /v1/auth/sessions expected 200, got ${sessions.status}: ${t}\n(Set SMOKE_SESSION_COOKIE from an authenticated browser session.)`
      )
    }
    const sessJson = (await sessions.json()) as {
      data?: { sessions?: unknown[] }
    }
    console.info(
      `[smoke:auth] GET /v1/auth/sessions ok (${sessJson.data?.sessions?.length ?? 0} sessions)`
    )
  } else {
    console.info(
      "[smoke:auth] skip GET /v1/auth/sessions (set SMOKE_SESSION_COOKIE to test authenticated session APIs)"
    )
  }

  await pool.end()
  console.info("[smoke:auth] all checks passed")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
