/**
 * Repo-root env surfaced through `vite.config` `define` (see `loadEnv` + `import.meta.env`).
 * Single source: prefer server-style keys in `.env` where noted — avoids duplicating `VITE_*`.
 */

/** UUID from `DEMO_TENANT_ID` / `VITE_DEMO_TENANT_ID` — must exist in `mdm.tenants` and user memberships. */
export function getDemoTenantId(): string | undefined {
  const raw = import.meta.env.VITE_DEMO_TENANT_ID?.trim()
  return raw && raw.length > 0 ? raw : undefined
}

export function isDevLoginPrefillEnabled(): boolean {
  return import.meta.env.VITE_AFENDA_DEV_LOGIN_ENABLED === "true"
}

/** Email hint only — password stays server-side (`AFENDA_DEV_LOGIN_PASSWORD`). */
export function getDevLoginPrefillEmail(): string {
  if (!isDevLoginPrefillEnabled()) {
    return ""
  }
  return import.meta.env.VITE_DEV_LOGIN_EMAIL?.trim() ?? ""
}

/** Mirrors server `AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION` via `vite.config` `define`. */
export function isEmailVerificationRequired(): boolean {
  return import.meta.env.VITE_AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION === "true"
}
