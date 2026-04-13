import type { ApiCapabilityContract } from "../types/api"

/**
 * Public env keys consumed by {@link resolveApiClientConfigFromEnv}.
 * Never store secrets in `VITE_*` variables (they ship to the browser).
 */
export const apiClientEnvKeys = {
  baseUrl: "VITE_API_BASE_URL",
  timeoutMs: "VITE_API_TIMEOUT",
} as const

/**
 * Default relative API root when `VITE_API_BASE_URL` is unset: same origin, paths like `/api/...`
 * (see Vite `server.proxy` in `vite.config.ts`).
 */
export const apiDefaultPathPrefix = "/api"

export const apiCapabilityContract = {
  id: "api",
  title: "HTTP API client",
  status: "active",
  owner: "app-runtime",
  summary:
    "Typed fetch wrapper, env-based base URL, and timeouts for calling the Afenda HTTP API from the SPA.",
  publicImportsOnly: true,
  mayImportFeatureRoots: true,
  mayImportFeatureInternals: false,
} as const satisfies ApiCapabilityContract

export const apiPlatformPolicy = {
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
    "_features may import `_platform/api` public APIs; `_platform/api` must not import `_features` internals.",
  featureInternalImportPattern: "@/app/_features/*/*",
} as const
