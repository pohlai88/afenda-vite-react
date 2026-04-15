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
  /** @deprecated No longer required; dev one-click is shown whenever `import.meta.env.DEV`. */
  readonly VITE_AFENDA_DEV_QUICK_LOGIN?: string
  /** Optional: same email as your seeded Better Auth user — prefill link only (not a secret). */
  readonly VITE_AFENDA_DEV_LOGIN_EMAIL?: string
  /** Optional label for the dev quick-login button. */
  readonly VITE_AFENDA_DEV_LOGIN_LABEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
