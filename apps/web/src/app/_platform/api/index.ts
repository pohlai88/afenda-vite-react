export { ApiClientBoundary } from "./components/ApiClientBoundary"
export type { ApiClientBoundaryProps } from "./components/ApiClientBoundary"
export { fetchWithTimeout, resolveRequestUrl } from "./adapters/fetch-adapter"
export { useApiClient } from "./hooks/use-api-client"
export {
  apiCapabilityContract,
  apiClientEnvKeys,
  apiDefaultPathPrefix,
  apiPlatformPolicy,
} from "./policy/api-policy"
export { createApiCapabilityReport } from "./scripts/api-capability-report"
export type { ApiCapabilityReport } from "./scripts/api-capability-report"
export {
  ApiHttpError,
  createApiClient,
  getSharedApiClient,
  resetSharedApiClientForTests,
  resolveApiClientConfigFromEnv,
} from "./services/api-client-service"
export {
  joinApiUrl,
  normalizeApiBaseUrl,
  parseTimeoutMs,
} from "./utils/api-utils"
export type {
  ApiCapabilityContract,
  ApiClient,
  ApiClientConfig,
  ApiRequestBody,
  ApiRequestOptions,
  HttpMethod,
} from "./types/api"
