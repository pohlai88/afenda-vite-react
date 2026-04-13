import { fetchWithTimeout, resolveRequestUrl } from "../adapters/fetch-adapter"
import {
  defaultApiTimeoutMs,
  normalizeApiBaseUrl,
  parseTimeoutMs,
} from "../utils/api-utils"
import type {
  ApiClient,
  ApiClientConfig,
  ApiRequestOptions,
  HttpMethod,
} from "../types/api"

export class ApiHttpError extends Error {
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly body: unknown

  constructor(
    message: string,
    init: { status: number; statusText: string; url: string; body: unknown }
  ) {
    super(message)
    this.name = "ApiHttpError"
    this.status = init.status
    this.statusText = init.statusText
    this.url = init.url
    this.body = init.body
  }
}

export function resolveApiClientConfigFromEnv(
  env: ImportMetaEnv = import.meta.env
): ApiClientConfig {
  const baseUrl = normalizeApiBaseUrl(env.VITE_API_BASE_URL)
  const defaultTimeoutMs = parseTimeoutMs(
    env.VITE_API_TIMEOUT,
    defaultApiTimeoutMs
  )

  return {
    baseUrl,
    defaultTimeoutMs,
    defaultHeaders: {
      Accept: "application/json",
    },
  }
}

function normalizeBody(body: ApiRequestOptions["body"]): {
  readonly body: BodyInit | null | undefined
  readonly shouldSetJsonContentType: boolean
} {
  if (body === null || body === undefined) {
    return { body, shouldSetJsonContentType: false }
  }

  if (isBodyInit(body)) {
    return { body, shouldSetJsonContentType: false }
  }

  return { body: JSON.stringify(body), shouldSetJsonContentType: true }
}

function isBodyInit(body: ApiRequestOptions["body"]): body is BodyInit {
  if (typeof body === "string") {
    return true
  }
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return true
  }
  if (
    typeof URLSearchParams !== "undefined" &&
    body instanceof URLSearchParams
  ) {
    return true
  }
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return true
  }
  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
    return true
  }
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(body)) {
    return true
  }
  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    return true
  }
  return false
}

function mergeHeaders(
  base: Readonly<Record<string, string>>,
  extra?: HeadersInit
): Headers {
  const h = new Headers(base)
  if (extra) {
    const next = new Headers(extra)
    next.forEach((value, key) => {
      h.set(key, value)
    })
  }
  return h
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (text === "") {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function resolveMethod(
  init: ApiRequestOptions | undefined,
  fallback: HttpMethod
): HttpMethod {
  const m = init?.method
  if (
    m === "GET" ||
    m === "POST" ||
    m === "PUT" ||
    m === "PATCH" ||
    m === "DELETE"
  ) {
    return m
  }
  return fallback
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  async function coreRequest<T>(
    method: HttpMethod,
    path: string,
    init: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      timeoutMs = config.defaultTimeoutMs,
      parseJson = true,
      body,
      headers,
      method: _ignored,
      ...rest
    } = init

    const url = resolveRequestUrl(config.baseUrl, path)
    const mergedHeaders = mergeHeaders(config.defaultHeaders, headers)
    const normalizedBody = normalizeBody(body)

    if (
      normalizedBody.body !== undefined &&
      normalizedBody.body !== null &&
      normalizedBody.shouldSetJsonContentType &&
      !mergedHeaders.has("Content-Type")
    ) {
      mergedHeaders.set("Content-Type", "application/json")
    }

    const response = await fetchWithTimeout({
      url,
      init: {
        ...rest,
        method,
        headers: mergedHeaders,
        body:
          normalizedBody.body === undefined ? undefined : normalizedBody.body,
      },
      timeoutMs,
    })

    if (!response.ok) {
      const errBody = await parseJsonBody(response)
      throw new ApiHttpError(
        `HTTP ${response.status} ${response.statusText} for ${url}`,
        {
          status: response.status,
          statusText: response.statusText,
          url,
          body: errBody,
        }
      )
    }

    if (!parseJson) {
      return response as unknown as T
    }

    return (await parseJsonBody(response)) as T
  }

  return {
    config,
    request: (path, init) =>
      coreRequest(resolveMethod(init, "GET"), path, init ?? {}),
    get: (path, init) => coreRequest("GET", path, { ...init, method: "GET" }),
    post: (path, body, init) =>
      coreRequest("POST", path, { ...init, method: "POST", body }),
    put: (path, body, init) =>
      coreRequest("PUT", path, { ...init, method: "PUT", body }),
    patch: (path, body, init) =>
      coreRequest("PATCH", path, { ...init, method: "PATCH", body }),
    delete: (path, init) =>
      coreRequest("DELETE", path, { ...init, method: "DELETE" }),
  }
}

let sharedClient: ApiClient | undefined

/**
 * Lazily constructed default client from {@link resolveApiClientConfigFromEnv}.
 * Prefer passing `createApiClient` from tests or providers if you need isolation.
 */
export function getSharedApiClient(): ApiClient {
  if (!sharedClient) {
    sharedClient = createApiClient(resolveApiClientConfigFromEnv())
  }
  return sharedClient
}

/** Test-only: clears the lazy singleton so the next `getSharedApiClient()` rebuilds from env. */
export function resetSharedApiClientForTests(): void {
  sharedClient = undefined
}
