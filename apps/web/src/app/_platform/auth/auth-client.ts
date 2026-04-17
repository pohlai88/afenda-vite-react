import type {} from "@better-auth/core/oauth2"
import type {} from "@better-auth/core/utils/error-codes"
import { passkeyClient } from "@better-auth/passkey/client"
import { createAuthClient } from "better-auth/react"
import { organizationClient, twoFactorClient } from "better-auth/client/plugins"

function resolveBetterAuthBaseUrl(): string | undefined {
  const raw = import.meta.env.VITE_BETTER_AUTH_BASE_URL?.trim()
  return raw && raw.length > 0 ? raw : undefined
}

const betterAuthBaseUrl = resolveBetterAuthBaseUrl()

function resolveAuthClientPlugins(): Array<
  | ReturnType<typeof organizationClient>
  | ReturnType<typeof passkeyClient>
  | ReturnType<typeof twoFactorClient>
> {
  const plugins: Array<
    | ReturnType<typeof organizationClient>
    | ReturnType<typeof passkeyClient>
    | ReturnType<typeof twoFactorClient>
  > = [organizationClient()]
  if (import.meta.env.VITE_AFENDA_AUTH_PASSKEY_ENABLED === "true") {
    plugins.push(passkeyClient())
  }
  if (import.meta.env.VITE_AFENDA_AUTH_MFA_ENABLED === "true") {
    plugins.push(twoFactorClient())
  }
  return plugins
}

const authClientPlugins = resolveAuthClientPlugins()

/**
 * Browser Better Auth client.
 * - Default: same-origin → Vite `/api` proxy → self-hosted `auth.handler` in `apps/api`.
 * - Optional `VITE_BETTER_AUTH_BASE_URL`: Neon Auth or another Better Auth–compatible HTTPS origin.
 *
 * `organizationClient` matches the server `organization()` plugin. Server capability flags
 * (`AFENDA_AUTH_*`) must match these Vite flags for passkey/MFA so client plugins align with `createAfendaAuth`.
 *
 * Type-only imports above satisfy TS2742 (portable declarations) for `composite` projects.
 */
export const authClient = createAuthClient({
  ...(betterAuthBaseUrl ? { baseURL: betterAuthBaseUrl } : {}),
  plugins: authClientPlugins,
  fetchOptions: {
    credentials: "include",
  },
})

/** Same reactive session hook as `authClient.useSession` — stable export for route guards and chrome. */
export const useAfendaSession = authClient.useSession
