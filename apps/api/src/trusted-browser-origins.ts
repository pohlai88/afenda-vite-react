/** Same list as `BETTER_AUTH_TRUSTED_ORIGINS` / defaults in `@afenda/better-auth`. */
export function trustedBrowserOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.trim()
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return ["http://localhost:5173", "http://127.0.0.1:5173"]
}
