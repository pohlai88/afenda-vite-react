/** Must match `AFENDA_EMAIL_DELIVERY_FAILED` from `@afenda/better-auth` mail hooks. */
const AUTH_EMAIL_DELIVERY_FAILED = "AFENDA_EMAIL_DELIVERY_FAILED"
/** Sync with `AFENDA_EMAIL_DELIVERY_FAILED_MESSAGE` in `@afenda/better-auth` (`APIError` body). */
const AUTH_EMAIL_DELIVERY_MESSAGE =
  "Email could not be sent. Try again shortly."

export function mapAuthErrorToUserMessage(
  code: string | null | undefined,
  fallback = "Unable to continue. Please try again."
): string {
  const normalized = (code ?? "").trim()

  if (
    normalized === AUTH_EMAIL_DELIVERY_FAILED ||
    normalized === AUTH_EMAIL_DELIVERY_MESSAGE
  ) {
    return "We could not send email right now. Try again in a moment or contact support if this persists."
  }

  if (normalized === "auth.challenge.invalid") {
    return "Challenge verification failed. Try another method."
  }

  if (normalized === "auth.challenge.mismatch") {
    return "Challenge verification failed. Try another method."
  }

  if (normalized === "http_401") {
    return "Authentication is required for this action."
  }

  if (normalized === "http_403") {
    return "This sign-in attempt is not allowed."
  }

  if (normalized === "EMAIL_NOT_VERIFIED") {
    return "Please verify your email before signing in."
  }

  if (
    normalized === "INVALID_CODE" ||
    normalized === "INVALID_TWO_FACTOR_COOKIE"
  ) {
    return "That verification code did not work. Try again or go back and sign in with your password."
  }

  if (normalized === "http_404") {
    return "The requested auth resource was not found."
  }

  if (normalized === "tenant_selection_required") {
    return "Choose the workspace that should become your active operating context."
  }

  if (normalized === "tenant_context_resolution_failed") {
    return "We could not resolve your workspace access yet. Check your membership or contact support."
  }

  if (normalized === "auth_not_configured") {
    return "Authentication is online, but tenant activation is not configured for this environment yet."
  }

  if (normalized === "http_408") {
    return "The request timed out. Please try again."
  }

  if (normalized === "http_429") {
    return "Too many attempts. Please wait and try again."
  }

  if (normalized.startsWith("http_5")) {
    return "The authentication service is temporarily unavailable. Please try again shortly."
  }

  if (normalized.startsWith("http_")) {
    return "The request could not be completed. Please try again."
  }

  return fallback
}
