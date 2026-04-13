export const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const

export type HttpMethod = (typeof httpMethods)[number]

export interface ApiClientConfig {
  readonly baseUrl: string
  readonly defaultTimeoutMs: number
  readonly defaultHeaders: Readonly<Record<string, string>>
}

export type ApiRequestBody =
  | BodyInit
  | null
  | Record<string, unknown>
  | readonly unknown[]

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  readonly timeoutMs?: number
  /** When true (default), response body is parsed as JSON. When false, returns raw Response. */
  readonly parseJson?: boolean
  readonly body?: ApiRequestBody
}

export interface ApiClient {
  readonly config: Readonly<ApiClientConfig>
  request<T>(path: string, init?: ApiRequestOptions): Promise<T>
  get<T>(path: string, init?: ApiRequestOptions): Promise<T>
  post<T>(
    path: string,
    body?: ApiRequestBody,
    init?: ApiRequestOptions
  ): Promise<T>
  put<T>(
    path: string,
    body?: ApiRequestBody,
    init?: ApiRequestOptions
  ): Promise<T>
  patch<T>(
    path: string,
    body?: ApiRequestBody,
    init?: ApiRequestOptions
  ): Promise<T>
  delete<T>(path: string, init?: ApiRequestOptions): Promise<T>
}

export interface ApiCapabilityContract {
  readonly id: "api"
  readonly title: string
  readonly status: "planned" | "active" | "migrating" | "deprecated"
  readonly owner: "app-runtime"
  readonly summary: string
  readonly publicImportsOnly: boolean
  readonly mayImportFeatureRoots: boolean
  readonly mayImportFeatureInternals: boolean
}
