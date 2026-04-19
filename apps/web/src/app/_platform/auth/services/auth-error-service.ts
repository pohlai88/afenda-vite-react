import { ApiClientHttpError } from "../../runtime"

export class AuthServiceError extends Error {
  readonly code: string

  constructor(code: string, message?: string) {
    super(message ?? code)
    this.name = "AuthServiceError"
    this.code = code
  }
}

function readErrorCodeFromHttpError(error: ApiClientHttpError): string {
  const body = error.body
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    (body as { error: unknown }).error &&
    typeof (body as { error: unknown }).error === "object"
  ) {
    const errorObj = (body as { error: { code?: unknown } }).error
    if (typeof errorObj.code === "string" && errorObj.code.length > 0) {
      return errorObj.code
    }
  }
  return `http_${error.status}`
}

export function normalizeAuthServiceErrorCode(value: unknown): string {
  if (value instanceof AuthServiceError) {
    return value.code
  }

  if (value instanceof ApiClientHttpError) {
    return readErrorCodeFromHttpError(value)
  }

  if (value instanceof Error) {
    const message = value.message.trim()
    return message.length > 0 ? message : "unknown_error"
  }

  return "unknown_error"
}

export function throwAuthServiceError(code: string): never {
  throw new AuthServiceError(code)
}

/**
 * Maps unknown errors (HTTP, {@link AuthServiceError}, or generic `Error`) to a stable code string.
 * Prefer this at API boundaries; use {@link normalizeAuthServiceErrorCode} when you only handle thrown service errors.
 */
export function resolveAuthErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code.trim()
    if (code.length > 0) {
      return code
    }
  }
  return normalizeAuthServiceErrorCode(error)
}
