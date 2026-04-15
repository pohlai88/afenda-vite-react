/**
 * Absolute URLs for Better Auth redirects (OAuth, email verification, password reset).
 * Honors Vite `base` / `import.meta.env.BASE_URL` when the app is not served at `/`.
 */
function viteBasePath(): string {
  const base = import.meta.env.BASE_URL
  if (base === "/" || base === "") return ""
  return base.endsWith("/") ? base.slice(0, -1) : base
}

/** Post-login destination inside the SPA (e.g. `/app` or `/preview/app`). */
export function authAppCallbackUrl(): string {
  const path = `${viteBasePath()}/app`
  return `${window.location.origin}${path}`
}

/** Where the user lands after clicking the password-reset link in email. */
export function authPasswordResetRedirectUrl(): string {
  const path = `${viteBasePath()}/reset-password`
  return `${window.location.origin}${path}`
}

/**
 * After email/password sign-in or sign-up, navigate here. Prefer `location.state.from`
 * (set by {@link RequireAuth}) so deep links return to the intended `/app/...` route.
 */
export function authPostLoginPath(state: unknown): string {
  if (
    state &&
    typeof state === "object" &&
    "from" in state &&
    typeof (state as { from: unknown }).from === "string"
  ) {
    const from = (state as { from: string }).from.trim()
    if (from.startsWith("/") && !from.startsWith("//")) {
      return from
    }
  }
  return `${viteBasePath()}/app`
}
