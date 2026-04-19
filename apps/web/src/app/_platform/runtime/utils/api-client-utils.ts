/**
 * Join a base URL (optional) with an API path for the **browser** api-client.
 * Path should usually start with `/`.
 */
export function joinApiClientUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const trimmed = baseUrl.trim()
  if (trimmed === "") {
    return normalizedPath
  }
  const withoutTrailing = trimmed.replace(/\/+$/, "")
  return `${withoutTrailing}${normalizedPath}`
}

/** Normalize `VITE_API_BASE_URL` for the SPA api-client. */
export function normalizeApiClientBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? ""
  if (trimmed === "") {
    return ""
  }

  if (trimmed.startsWith("//")) {
    throw new Error(
      "VITE_API_BASE_URL must be a same-origin path, not a protocol-relative URL."
    )
  }

  if (trimmed.startsWith("/")) {
    return trimmed === "/" ? "" : trimmed.replace(/\/+$/, "")
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error(
      "VITE_API_BASE_URL must be empty, a same-origin path starting with `/`, or an absolute http(s) URL."
    )
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL must use http or https.")
  }

  return trimmed.replace(/\/+$/, "")
}

const MIN_TIMEOUT_MS = 1_000
const MAX_TIMEOUT_MS = 120_000

/** Parse timeout from env for the api-client (ms). */
export function parseApiClientTimeoutMs(
  raw: string | undefined,
  fallback: number
): number {
  if (raw === undefined || raw === "") {
    return fallback
  }
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) {
    return fallback
  }
  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, n))
}

export const defaultApiClientTimeoutMs = 30_000

/**
 * Same-origin dev: `/api/v1/*` is proxied to `@afenda/api` `/v1/*` (see `apps/web/vite.config.ts`).
 * With an absolute `VITE_API_BASE_URL`, paths are joined to that origin’s `/v1/*`.
 */
export function resolveApiV1Path(
  path: string,
  env: ImportMetaEnv = import.meta.env
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const base = normalizeApiClientBaseUrl(env.VITE_API_BASE_URL)
  if (base === "") {
    return `/api/v1${normalized}`
  }
  return joinApiClientUrl(base, `/v1${normalized}`)
}
