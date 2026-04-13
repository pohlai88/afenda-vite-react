import { useMemo } from "react"

import { getSharedApiClient } from "../services/api-client-service"
import type { ApiClient } from "../types/api"

/**
 * Stable reference to the shared {@link ApiClient} for the SPA shell.
 */
export function useApiClient(): ApiClient {
  return useMemo(() => getSharedApiClient(), [])
}
