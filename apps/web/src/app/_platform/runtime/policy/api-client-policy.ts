import type { ApiClientCapabilityContract } from "../types/api-client-types"

/**
 * Browser HTTP client capability — `_platform/runtime` only.
 *
 * Verification:
 * - **This** policy describes the SPA `fetch` client (env `VITE_*`, same-origin `/api/...`).
 * - **Server** HTTP lives in `apps/api` (`@afenda/api`), not under `_platform`.
 * - Capability id **`api-client`** is intentional; do not shorten to `api` (ambiguous vs `apps/api`).
 *
 * Public env keys consumed by {@link resolveApiClientConfigFromEnv}.
 * Never store secrets in `VITE_*` variables (they ship to the browser).
 */
export const apiClientEnvKeys = {
  baseUrl: "VITE_API_BASE_URL",
  timeoutMs: "VITE_API_TIMEOUT",
} as const

/**
 * Default relative HTTP path prefix when `VITE_API_BASE_URL` is unset: same origin, paths like `/api/...`
 * (see Vite `server.proxy` in `vite.config.ts`).
 */
export const apiClientDefaultPathPrefix = "/api"

export const apiClientCapabilityContract = {
  id: "api-client",
  title: "HTTP API client",
  status: "active",
  owner: "app-runtime",
  summary:
    "Typed fetch wrapper, env-based base URL, and timeouts for calling the Afenda HTTP API from the SPA.",
  publicImportsOnly: true,
  mayImportFeatureRoots: true,
  mayImportFeatureInternals: false,
} as const satisfies ApiClientCapabilityContract

export const apiClientPlatformPolicy = {
  /** Same folder layout as `_template` / `_platform/README.md`. */
  allowedPlatformFolders: [
    "adapters",
    "components",
    "hooks",
    "policy",
    "scripts",
    "services",
    "types",
    "utils",
    "__tests__",
  ],
  dependencyDirection:
    "_features may import `_platform/runtime` public APIs; `_platform/runtime` must not import `_features` internals.",
  featureInternalImportPattern: "app/_features/*/*",
} as const
