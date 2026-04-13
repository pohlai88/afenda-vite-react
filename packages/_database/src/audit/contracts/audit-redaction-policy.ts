/**
 * AUDIT REDACTION POLICY
 *
 * Defines which keys are forbidden, masked, or allowed before persisting audit payloads.
 */

const FORBIDDEN_KEYS = new Set([
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "clientSecret",
  "authorization",
  "cookie",
])

const MASKED_KEYS = new Set(["email", "phone", "ipAddress", "userAgent"])

function redactScalar(key: string, value: unknown): unknown {
  if (FORBIDDEN_KEYS.has(key)) {
    return "[REDACTED_FORBIDDEN]"
  }
  if (MASKED_KEYS.has(key)) {
    return "[REDACTED_MASKED]"
  }
  return value
}

export function redactAuditPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactAuditPayload)
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, nestedValue]) => [
        key,
        redactScalar(key, redactAuditPayload(nestedValue)),
      ]
    )
    return Object.fromEntries(entries)
  }

  return value
}
