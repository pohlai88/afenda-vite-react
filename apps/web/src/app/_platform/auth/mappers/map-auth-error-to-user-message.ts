export function mapAuthErrorToUserMessage(
  code: string | null | undefined,
  fallback = "Unable to continue. Please try again."
): string {
  const normalized = (code ?? "").trim()

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

  if (normalized === "http_404") {
    return "The requested auth resource was not found."
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
