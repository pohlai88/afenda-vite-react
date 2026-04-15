/**
 * Pure evaluation of whether dev quick login can succeed (for tests, smoke tools, and diagnostics).
 * Pass `process.env` from a Node context where repo-root `.env` / `.env.neon` were loaded.
 */
export type AfendaDevLoginReadiness = {
  /** `POST /api/dev/login` is registered (API not built as production). */
  readonly routeRegistered: boolean
  /** `AFENDA_DEV_LOGIN_*` sufficient for `signInEmail`. */
  readonly configuredForSignIn: boolean
  /** Env keys that must be set for one-click sign-in (human-oriented labels). */
  readonly missing: readonly string[]
  /** Related vars that should be set for Better Auth + DB (warnings, not all strictly required for evaluator). */
  readonly warnings: readonly string[]
}

export function evaluateAfendaDevLoginEnv(
  env: Record<string, string | undefined>
): AfendaDevLoginReadiness {
  const routeRegistered = env.NODE_ENV !== "production"

  const enabled = env.AFENDA_DEV_LOGIN_ENABLED === "true"
  const email = env.AFENDA_DEV_LOGIN_EMAIL?.trim()
  const password = env.AFENDA_DEV_LOGIN_PASSWORD

  const missing: string[] = []
  if (!enabled) {
    missing.push("AFENDA_DEV_LOGIN_ENABLED=true")
  }
  if (!email) {
    missing.push("AFENDA_DEV_LOGIN_EMAIL")
  }
  if (password === undefined || password === "") {
    missing.push("AFENDA_DEV_LOGIN_PASSWORD")
  }

  const configuredForSignIn =
    enabled && Boolean(email) && password !== undefined && password !== ""

  const warnings: string[] = []
  if (!env.BETTER_AUTH_URL?.trim()) {
    warnings.push("BETTER_AUTH_URL (e.g. http://localhost:5173 for Vite dev)")
  }
  if (!env.BETTER_AUTH_SECRET?.trim()) {
    warnings.push("BETTER_AUTH_SECRET")
  }
  if (!env.DATABASE_URL?.trim()) {
    warnings.push("DATABASE_URL")
  }
  if (env.AFENDA_DEV_LOGIN_SECRET?.trim()) {
    warnings.push(
      "AFENDA_DEV_LOGIN_SECRET is set — browser must send X-Afenda-Dev-Login-Secret"
    )
  }

  return {
    routeRegistered,
    configuredForSignIn,
    missing,
    warnings,
  }
}
