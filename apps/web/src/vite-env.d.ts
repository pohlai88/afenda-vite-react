/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Same-origin relative paths (e.g. `/api`) or absolute origin (e.g. `http://localhost:3000`). */
  readonly VITE_API_BASE_URL?: string
  /** Request timeout in milliseconds for the default API client. */
  readonly VITE_API_TIMEOUT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
