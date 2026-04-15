import type {} from "@better-auth/core/oauth2"
import type {} from "@better-auth/core/utils/error-codes"
import { createAuthClient } from "better-auth/react"

function resolveBetterAuthBaseUrl(): string | undefined {
  const raw = import.meta.env.VITE_BETTER_AUTH_BASE_URL?.trim()
  return raw && raw.length > 0 ? raw : undefined
}

const betterAuthBaseUrl = resolveBetterAuthBaseUrl()

/**
 * Browser Better Auth client.
 * - Default: same-origin → Vite `/api` proxy → self-hosted `auth.handler` in `apps/api`.
 * - Optional `VITE_BETTER_AUTH_BASE_URL`: Neon Auth or another Better Auth–compatible HTTPS origin.
 *
 * Type-only imports above satisfy TS2742 (portable declarations) for `composite` projects.
 */
export const authClient = createAuthClient({
  ...(betterAuthBaseUrl ? { baseURL: betterAuthBaseUrl } : {}),
  fetchOptions: {
    credentials: "include",
  },
})
