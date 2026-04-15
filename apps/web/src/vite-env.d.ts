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
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
