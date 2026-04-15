/**
 * Smoke-test `@afenda/api` + dev quick login + Better Auth surface.
 *
 * Prerequisites: API running (`pnpm --filter @afenda/api dev`), env loaded from repo-root `.env` / `.env.neon`.
 *
 *   pnpm exec tsx scripts/dev-login-api-smoke.ts
 *
 * Env:
 *   `AUDIT_API_URL` — default `http://localhost:3001`
 *   `SMOK_STRICT_DEV_LOGIN` — if `true`, exit 1 when POST /api/dev/login returns 503 (expect configured dev login)
 */

const base = (process.env.AUDIT_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  ""
)

const strictDevLogin = process.env.SMOK_STRICT_DEV_LOGIN === "true"

function fail(msg: string): never {
  console.error(msg)
  process.exit(1)
}

async function main(): Promise<void> {
  console.info(`[smoke] base URL: ${base}\n`)

  const root = await fetch(`${base}/`)
  if (!root.ok) {
    fail(`GET / failed: ${root.status} — is the API running?`)
  }
  const rootJson = (await root.json()) as { service?: string }
  if (rootJson.service !== "@afenda/api") {
    console.info("[smoke] GET / body unexpected:", rootJson)
  }
  console.info("[smoke] GET / OK")

  const health = await fetch(`${base}/health`)
  if (!health.ok) {
    fail(`GET /health failed: ${health.status}`)
  }
  const h = (await health.json()) as { ok?: boolean }
  if (!h.ok) {
    fail(`GET /health: unexpected body ${JSON.stringify(h)}`)
  }
  console.info("[smoke] GET /health OK")

  const authOk = await fetch(`${base}/api/auth/ok`)
  if (authOk.ok) {
    const body = await authOk.text()
    console.info("[smoke] GET /api/auth/ok OK", body.slice(0, 120))
  } else {
    console.info(
      `[smoke] GET /api/auth/ok → ${authOk.status} (optional; schema or route may differ)`
    )
  }

  const devHeaders = new Headers()
  devHeaders.set("Content-Type", "application/json")
  devHeaders.set("Origin", "http://localhost:5173")
  const secret = process.env.AFENDA_DEV_LOGIN_SECRET?.trim()
  if (secret) {
    devHeaders.set("X-Afenda-Dev-Login-Secret", secret)
  }

  const devLogin = await fetch(`${base}/api/dev/login`, {
    method: "POST",
    headers: devHeaders,
    body: "{}",
  })

  const devCt = devLogin.headers.get("content-type") ?? ""
  let devJson: { error?: string } | null = null
  if (devCt.includes("application/json")) {
    try {
      devJson = (await devLogin.json()) as { error?: string }
    } catch {
      devJson = null
    }
  }

  if (devLogin.status === 503) {
    const msg = devJson?.error ?? "(no JSON body)"
    console.info(
      `[smoke] POST /api/dev/login → 503 (configure env to get 200 + cookies)\n       ${msg}`
    )
    if (strictDevLogin) {
      fail(
        "[smoke] SMOK_STRICT_DEV_LOGIN=true but dev login returned 503 — fix AFENDA_DEV_LOGIN_* in repo-root .env / .env.neon and restart the API."
      )
    }
  } else if (devLogin.status === 401 || devLogin.status === 403) {
    console.info(
      `[smoke] POST /api/dev/login → ${devLogin.status}`,
      devJson ?? "(body not parsed as JSON)"
    )
  } else if (devLogin.ok) {
    const setCookie =
      typeof devLogin.headers.getSetCookie === "function"
        ? devLogin.headers.getSetCookie()
        : devLogin.headers.get("set-cookie")
          ? [devLogin.headers.get("set-cookie")!]
          : []
    console.info(
      `[smoke] POST /api/dev/login → ${devLogin.status} (Set-Cookie: ${setCookie.length} value(s))`
    )
    if (setCookie.length === 0) {
      console.info(
        "[smoke] No Set-Cookie on success — check Better Auth cookie settings and BETTER_AUTH_URL."
      )
    }
  } else {
    const detail =
      devJson ??
      (devCt.includes("application/json")
        ? "(JSON already consumed)"
        : (await devLogin.text()).slice(0, 300))
    console.info(`[smoke] POST /api/dev/login → ${devLogin.status}`, detail)
  }

  console.info(
    "\n[smoke] --- Human checklist (if browser login still fails) ---"
  )
  console.info(
    "  1. API loads repo-root .env.neon then .env — put AFENDA_DEV_LOGIN_* in either file; restart API."
  )
  console.info(
    "  2. BETTER_AUTH_URL must match the SPA origin, e.g. http://localhost:5173 (Vite dev)."
  )
  console.info(
    "  3. AFENDA_DEV_LOGIN_EMAIL + PASSWORD must match a user from /register (same database)."
  )
  console.info(
    "  4. Vite proxies /api to the API — start both: api :3001 and web :5173."
  )
  console.info(
    "  5. If AFENDA_DEV_LOGIN_SECRET is set, paste it into the login page optional field or export it for this script.\n"
  )

  console.info("[smoke] Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
