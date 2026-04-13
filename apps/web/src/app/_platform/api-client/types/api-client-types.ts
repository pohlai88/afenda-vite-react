export const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const

export type HttpMethod = (typeof httpMethods)[number]

export interface ApiClientConfig {
  readonly baseUrl: string
  readonly defaultTimeoutMs: number
  readonly defaultHeaders: Readonly<Record<string, string>>
}

export type ApiClientRequestBody =
  | BodyInit
  | null
  | Record<string, unknown>
  | readonly unknown[]

export interface ApiClientRequestOptions extends Omit<RequestInit, "body"> {
  readonly timeoutMs?: number
  /** When true (default), response body is parsed as JSON. When false, returns raw Response. */
  readonly parseJson?: boolean
  readonly body?: ApiClientRequestBody
}

export interface ApiClient {
  readonly config: Readonly<ApiClientConfig>
  request<T>(path: string, init?: ApiClientRequestOptions): Promise<T>
  get<T>(path: string, init?: ApiClientRequestOptions): Promise<T>
  post<T>(
    path: string,
    body?: ApiClientRequestBody,
    init?: ApiClientRequestOptions
  ): Promise<T>
  put<T>(
    path: string,
    body?: ApiClientRequestBody,
    init?: ApiClientRequestOptions
  ): Promise<T>
  patch<T>(
    path: string,
    body?: ApiClientRequestBody,
    init?: ApiClientRequestOptions
  ): Promise<T>
  delete<T>(path: string, init?: ApiClientRequestOptions): Promise<T>
}

/**
 * Metadata for the **browser** HTTP client under `_platform/api-client`.
 *
 * **Naming (do not confuse):**
 * - `id` is **`"api-client"`** — the Vite SPA fetch wrapper and hooks.
 * - **`apps/api`** is the **Node server** (`@afenda/api`); it is not this capability.
 */
export interface ApiClientCapabilityContract {
  /** Always `"api-client"` for this module (never `"api"` alone — that collides with server naming). */
  readonly id: "api-client"
  readonly title: string
  readonly status: "planned" | "active" | "migrating" | "deprecated"
  readonly owner: "app-runtime"
  readonly summary: string
  readonly publicImportsOnly: boolean
  readonly mayImportFeatureRoots: boolean
  readonly mayImportFeatureInternals: boolean
}
