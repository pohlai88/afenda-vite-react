/**
 * Stable JSON for audit rows and payloads: `Date` values become ISO-8601 strings.
 * Use for exports, logs, and cross-service boundaries where native `Date` serialization is inconsistent.
 */
export function jsonWithIsoDates(value: unknown): string {
  return JSON.stringify(value, (_, v) =>
    v instanceof Date ? v.toISOString() : v
  )
}
