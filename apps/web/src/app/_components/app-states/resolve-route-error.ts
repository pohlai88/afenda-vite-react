import { isRouteErrorResponse } from "react-router-dom"

/**
 * Stable single-line string for logs, support, and dev-only route error surfaces.
 */
export function resolveRouteErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    const status = String(error.status)
    const statusText = normalizeNonEmptyString(error.statusText)

    if (statusText) {
      return `${status} ${statusText}`
    }

    const dataMessage = extractMessageFromUnknown(error.data)
    if (dataMessage) {
      return `${status} ${dataMessage}`
    }

    return status
  }

  if (error instanceof Error) {
    const message = normalizeNonEmptyString(error.message)
    if (message) {
      return message
    }

    return normalizeNonEmptyString(error.name) ?? "Error"
  }

  const message = extractMessageFromUnknown(error)
  if (message) {
    return message
  }

  if (
    error !== null &&
    typeof error !== "object" &&
    typeof error !== "string" &&
    typeof error !== "undefined"
  ) {
    return String(error)
  }

  return "Unknown error"
}

function extractMessageFromUnknown(value: unknown): string | null {
  const direct = normalizeNonEmptyString(value)
  if (direct) {
    return direct
  }

  if (!value || typeof value !== "object") {
    return null
  }

  return "message" in value
    ? normalizeNonEmptyString((value as { message?: unknown }).message)
    : null
}

function normalizeNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.replace(/\s+/g, " ").trim()
  return normalized.length > 0 ? normalized : null
}
