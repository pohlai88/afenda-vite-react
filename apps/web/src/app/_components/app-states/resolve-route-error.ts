import { isRouteErrorResponse } from "react-router-dom"

/**
 * Stable string for logs, support, and dev-only route error surfaces.
 */
export function resolveRouteErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    const text = error.statusText?.trim()
    return text ? `${error.status} ${text}` : `${error.status}`
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string" && error.length > 0) {
    return error
  }
  if (error !== null && typeof error !== "object") {
    return String(error)
  }
  return "Unknown error"
}
