/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Same-origin relative paths (e.g. `/api`) or absolute origin (e.g. `http://localhost:3000`). */
  readonly VITE_API_BASE_URL?: string
  /** Request timeout in milliseconds for the default API client. */
  readonly VITE_API_TIMEOUT?: string
  /** Demo tenant UUID for workspace CRUD sample routes. */
  readonly VITE_DEMO_TENANT_ID?: string
  /**
   * Optional Better Auth client base (e.g. Neon Auth). When unset, uses same-origin `/api` proxy.
   */
  readonly VITE_BETTER_AUTH_BASE_URL?: string
  /** Mirror server `AFENDA_AUTH_PASSKEY_ENABLED` so client loads `passkeyClient` when the API registers the passkey plugin. */
  readonly VITE_AFENDA_AUTH_PASSKEY_ENABLED?: string
  /** Mirror server `AFENDA_AUTH_MFA_ENABLED` for `twoFactorClient`. */
  readonly VITE_AFENDA_AUTH_MFA_ENABLED?: string
  /** When `true`, loads `dashClient` (Better Auth Infrastructure). Enable when API has `dash()` and `BETTER_AUTH_API_KEY`. */
  readonly VITE_BETTER_AUTH_INFRA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
