/**
 * Ensures `@afenda/api` is up before Playwright starts the Vite `webServer` and tests.
 * Better Auth routes are served from the API host; the SPA proxies `/api/*` to it.
 */
export default async function globalSetup(): Promise<void> {
  if (
    process.env.E2E_SKIP_API_WAIT === "1" ||
    process.env.E2E_SKIP_API_WAIT === "true"
  ) {
    return
  }

  const url =
    process.env.E2E_API_HEALTH_URL?.trim() || "http://localhost:8787/health"
  const deadline = Date.now() + 90_000

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) })
      if (res.ok) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1_000))
  }

  throw new Error(
    `[e2e] API not reachable at ${url} within 90s. In another terminal run: pnpm --filter @afenda/api dev\n` +
      "(Or set E2E_SKIP_API_WAIT=1 only if you are testing UI-only — /api/auth tests will fail.)"
  )
}
