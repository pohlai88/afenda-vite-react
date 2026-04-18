import { DEFAULT_BETTER_AUTH_TRUSTED_ORIGINS } from "@afenda/better-auth"

/**
 * CORS `Origin` allowlist for `/api/auth/*`.
 * Defaults match `createAfendaAuth` `trustedOrigins` via {@link DEFAULT_BETTER_AUTH_TRUSTED_ORIGINS}.
 */
export function trustedBrowserOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.trim()
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return [...DEFAULT_BETTER_AUTH_TRUSTED_ORIGINS]
}
