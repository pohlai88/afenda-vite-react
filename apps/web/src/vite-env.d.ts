/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Same-origin relative paths (e.g. `/api`) or absolute origin (e.g. `http://localhost:3000`). */
  readonly VITE_API_BASE_URL?: string
  /** Request timeout in milliseconds for the default API client. */
  readonly VITE_API_TIMEOUT?: string
  /** Demo tenant UUID for workspace CRUD sample routes. */
  readonly VITE_DEMO_TENANT_ID?: string
  /**
   * Optional Better Auth client base (e.g. Neon Auth). When unset, uses same-origin `/api` proxy.
   */
  readonly VITE_BETTER_AUTH_BASE_URL?: string
  /**
   * When not `"false"`, mirrors `AFENDA_AUTH_ALL_PLUGINS` — enables the full client plugin stack
   * (`adminClient`, `apiKeyClient`, `usernameClient`, `emailOTPClient`, etc.) in `auth-client.ts`.
   */
  readonly VITE_AFENDA_AUTH_ALL_PLUGINS?: string
  /**
   * Optional JSON array of {@link AuthMethodId} strings to restrict which sign-in methods the UI
   * offers for the current tenant (e.g. `["password","social"]`). When unset, all methods are shown.
   */
  readonly VITE_AFENDA_TENANT_AUTH_METHODS?: string
  /**
   * Mirror server `AFENDA_AUTH_PASSKEY_ENABLED` — injected in `vite.config` from `VITE_*` or unprefixed
   * `AFENDA_AUTH_PASSKEY_ENABLED` (same pattern as email verification / step-up).
   */
  readonly VITE_AFENDA_AUTH_PASSKEY_ENABLED?: string
  /** Same pairing for `AFENDA_AUTH_MFA_ENABLED` / `twoFactorClient`. */
  readonly VITE_AFENDA_AUTH_MFA_ENABLED?: string
  /** When `true`, loads `magicLinkClient` — must match server `AFENDA_AUTH_MAGIC_LINK_ENABLED` + `magicLink()`. */
  readonly VITE_AFENDA_AUTH_MAGIC_LINK_ENABLED?: string
  /** When `true`, loads `oneTapClient` — must match server `AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED` + `oneTap()`. */
  readonly VITE_AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED?: string
  /** Google OAuth web client ID for One Tap (GIS); often same as `GOOGLE_CLIENT_ID`. */
  readonly VITE_GOOGLE_CLIENT_ID?: string
  /** When set, enables GitHub in Better Auth UI `socialProviders` (server must register GitHub OAuth). */
  readonly VITE_GITHUB_CLIENT_ID?: string
  /** When `true`, loads `agentAuthClient` — must match server `AFENDA_AUTH_AGENT_AUTH_ENABLED` + `agentAuth()`. */
  readonly VITE_AFENDA_AUTH_AGENT_AUTH_ENABLED?: string
  /** When `true`, omits `agentAuthClient` — mirrors `AFENDA_AUTH_DISABLE_AGENT_AUTH`. */
  readonly VITE_AFENDA_AUTH_DISABLE_AGENT_AUTH?: string
  /** When `true`, omits OAuth `deviceAuthorizationClient` — mirrors `AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION`. */
  readonly VITE_AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION?: string
  /** When `true`, loads `dashClient` (Better Auth Infrastructure). Enable when API has `dash()` and `BETTER_AUTH_API_KEY`. */
  readonly VITE_BETTER_AUTH_INFRA?: string
  /**
   * Mirrors server `AFENDA_AUTH_STEP_UP_POLICY` (`off` | `risk_based`). Injected from repo-root
   * `.env` via `vite.config` (falls back to `AFENDA_AUTH_STEP_UP_POLICY` when `VITE_*` unset).
   */
  readonly VITE_AFENDA_AUTH_STEP_UP_POLICY?: string
  /** When `true`, matches server `AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION` (register → verify before app). */
  readonly VITE_AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION?: string
  /** Injected from `DEMO_TENANT_ID` or `VITE_DEMO_TENANT_ID`. */
  readonly VITE_DEMO_TENANT_ID?: string
  /** `true` when `AFENDA_DEV_LOGIN_ENABLED=true` (local dev login hint + email prefill). */
  readonly VITE_AFENDA_DEV_LOGIN_ENABLED?: string
  /** Prefill email only — password remains `AFENDA_DEV_LOGIN_PASSWORD` (server `.env` only). */
  readonly VITE_DEV_LOGIN_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
