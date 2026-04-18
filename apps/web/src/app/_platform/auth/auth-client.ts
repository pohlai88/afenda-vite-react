import type { AfendaAuth } from "@afenda/better-auth"
import type { AuthClient } from "@better-auth-ui/react"
import type {} from "@better-auth/core/oauth2"
import type {} from "@better-auth/core/utils/error-codes"
import { apiKeyClient } from "@better-auth/api-key/client"
import { agentAuthClient } from "@better-auth/agent-auth/client"
import { dashClient } from "@better-auth/infra/client"
import { passkeyClient } from "@better-auth/passkey/client"
import { createAuthClient } from "better-auth/react"
import {
  adminClient,
  deviceAuthorizationClient,
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  jwtClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  oneTapClient,
  oneTimeTokenClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins"

function resolveBetterAuthBaseUrl(): string | undefined {
  const raw = import.meta.env.VITE_BETTER_AUTH_BASE_URL?.trim()
  return raw && raw.length > 0 ? raw : undefined
}

const betterAuthBaseUrl = resolveBetterAuthBaseUrl()

/**
 * When not `"false"`, matches server `AFENDA_AUTH_ALL_PLUGINS` — load every client plugin
 * that corresponds to `buildAfendaAuthPlugins`.
 */
function clientAllPluginsEnabled(): boolean {
  return import.meta.env.VITE_AFENDA_AUTH_ALL_PLUGINS !== "false"
}

/** Legacy opt-in flags (when full stack is off). */
function clientLegacyEnabled(viteFlag: string): boolean {
  return import.meta.env[viteFlag] === "true"
}

/** Mirrors server `afendaAuthAgentAuthPluginOn()` including `AFENDA_AUTH_DISABLE_AGENT_AUTH`. */
function clientAgentAuthPluginActive(): boolean {
  if (import.meta.env.VITE_AFENDA_AUTH_DISABLE_AGENT_AUTH === "true") {
    return false
  }
  return (
    clientAllPluginsEnabled() ||
    clientLegacyEnabled("VITE_AFENDA_AUTH_AGENT_AUTH_ENABLED")
  )
}

/** Mirrors OAuth `deviceAuthorization()` registration (excluded when agent-auth is on — same `POST /device/code`). */
function clientOAuthDeviceAuthorizationActive(): boolean {
  if (
    import.meta.env.VITE_AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION === "true"
  ) {
    return false
  }
  if (!clientAllPluginsEnabled()) return false
  return !clientAgentAuthPluginActive()
}

function resolveAuthClientPlugins() {
  const all = clientAllPluginsEnabled()
  const googleWebClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

  return [
    inferAdditionalFields<AfendaAuth>(),
    organizationClient(),
    ...(all
      ? [adminClient(), apiKeyClient(), usernameClient(), emailOTPClient()]
      : []),
    ...(all || clientLegacyEnabled("VITE_AFENDA_AUTH_MAGIC_LINK_ENABLED")
      ? [magicLinkClient()]
      : []),
    ...(all || clientLegacyEnabled("VITE_AFENDA_AUTH_MFA_ENABLED")
      ? [twoFactorClient()]
      : []),
    ...(all || clientLegacyEnabled("VITE_AFENDA_AUTH_PASSKEY_ENABLED")
      ? [passkeyClient()]
      : []),
    ...(all
      ? [lastLoginMethodClient(), multiSessionClient(), jwtClient()]
      : []),
    ...(all
      ? [
          ...(clientOAuthDeviceAuthorizationActive()
            ? [deviceAuthorizationClient()]
            : []),
          oneTimeTokenClient(),
          genericOAuthClient(),
        ]
      : []),
    ...((all ||
      clientLegacyEnabled("VITE_AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED")) &&
    googleWebClientId
      ? [oneTapClient({ clientId: googleWebClientId })]
      : []),
    ...(all || clientLegacyEnabled("VITE_AFENDA_AUTH_AGENT_AUTH_ENABLED")
      ? [agentAuthClient()]
      : []),
    ...(import.meta.env.VITE_BETTER_AUTH_INFRA === "true"
      ? [dashClient()]
      : []),
  ]
}

/**
 * Browser Better Auth client.
 * - Default: same-origin → Vite `/api` proxy → self-hosted `auth.handler` in `apps/api`.
 * - Optional `VITE_BETTER_AUTH_BASE_URL`: Neon Auth or another Better Auth–compatible HTTPS origin.
 *
 * **Plugin parity:** `AFENDA_AUTH_ALL_PLUGINS=true` (default) injects `VITE_AFENDA_AUTH_ALL_PLUGINS`
 * so every client plugin matches `createAfendaAuth` / `buildAfendaAuthPlugins`. Set
 * `AFENDA_AUTH_ALL_PLUGINS=false` to use legacy per-feature `AFENDA_AUTH_*_ENABLED` / `VITE_*` flags
 * for passkey, MFA, magic link, agent auth, and Google One Tap only.
 *
 * `inferAdditionalFields<AfendaAuth>()` keeps session/user additional fields aligned with
 * `createAfendaAuth` (`import type` only — no server code in the bundle).
 *
 * When MFA is enabled, password sign-in may return **`twoFactorRedirect`**; Better Auth UI handles
 * the follow-up step-up flow in the sign-in view.
 *
 * Type-only imports above satisfy TS2742 (portable declarations) for `composite` projects.
 *
 * @see https://www.better-auth.com/docs/concepts/client — client plugins extend `signIn` / hooks.
 *
 * Cast to `AuthClient` from `@better-auth-ui/react` to avoid TS7056 and align with `AuthUIProvider` /
 * hooks (`genericOAuthClient` supplies `accountInfo` per Better Auth Generic OAuth docs).
 */
const authClient = createAuthClient({
  ...(betterAuthBaseUrl ? { baseURL: betterAuthBaseUrl } : {}),
  plugins: resolveAuthClientPlugins(),
  fetchOptions: {
    credentials: "include" as const,
  },
}) as AuthClient
export { authClient }

/** Session + user types — aligned with server `createAfendaAuth` / `inferAdditionalFields<AfendaAuth>()`. */
export type AfendaClientSession = AfendaAuth["$Infer"]["Session"]

/** Matches server `AFENDA_AUTH_STEP_UP_POLICY` via `vite.config` `define` (see `VITE_AFENDA_AUTH_STEP_UP_POLICY`). */
export function getAfendaAuthStepUpPolicy(): "off" | "risk_based" {
  return import.meta.env.VITE_AFENDA_AUTH_STEP_UP_POLICY === "risk_based"
    ? "risk_based"
    : "off"
}

/** Same reactive session hook as `authClient.useSession` — stable export for route guards and chrome. */
export const useAfendaSession = authClient.useSession
