/**
 * Browser HTTP runtime only (`_platform/runtime`). Server HTTP is `apps/api` — not re-exported here.
 * @see README.md — naming convention: symbols use `ApiClient` / `apiClient` / `api-client-*` file names.
 */
export { ApiClientBoundary } from "./components/ApiClientBoundary"
export type { ApiClientBoundaryProps } from "./components/ApiClientBoundary"
export { fetchWithTimeout, resolveRequestUrl } from "./adapters/fetch-adapter"
export { useApiClient } from "./hooks/use-api-client"
export {
  apiClientCapabilityContract,
  apiClientDefaultPathPrefix,
  apiClientEnvKeys,
  apiClientPlatformPolicy,
} from "./policy/api-client-policy"
export { createApiClientCapabilityReport } from "./scripts/api-client-capability-report"
export type { ApiClientCapabilityReport } from "./scripts/api-client-capability-report"
export {
  ApiClientHttpError,
  createApiClient,
  getSharedApiClient,
  resetSharedApiClientForTests,
  resolveApiClientConfigFromEnv,
} from "./services/api-client-service"
export {
  defaultApiClientTimeoutMs,
  joinApiClientUrl,
  normalizeApiClientBaseUrl,
  parseApiClientTimeoutMs,
  resolveApiV1Path,
} from "./api-client-config"
export type {
  ApiClient,
  ApiClientCapabilityContract,
  ApiClientConfig,
  ApiClientRequestBody,
  ApiClientRequestOptions,
  HttpMethod,
} from "./types/api-client-types"
