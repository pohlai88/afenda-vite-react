/**
 * Absolute URLs for Better Auth redirects (OAuth, email verification, password reset).
 * Honors Vite `base` / `import.meta.env.BASE_URL` when the app is not served at `/`.
 */
import { resolveAuthPostLoginDestination } from "./contracts/auth-return-target"

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

/** Where the user lands after clicking the password-reset link in email (canonical route). */
export function authPasswordResetRedirectUrl(): string {
  const path = `${viteBasePath()}/auth/reset-password`
  return `${window.location.origin}${path}`
}

/**
 * After email/password sign-in or sign-up, navigate here. Prefer `location.state.from`
 * (set by {@link RequireAuth}) so deep links return to the intended `/app/...` route.
 */
export function authPostLoginPath(state: unknown): string {
  return resolveAuthPostLoginDestination(state, `${viteBasePath()}/app`)
}

export { viteBasePath }
