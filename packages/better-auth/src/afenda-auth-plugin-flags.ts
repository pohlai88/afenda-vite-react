/**
 * Central flags for which Better Auth plugins are active in `createAfendaAuth`.
 *
 * - **Default**: `AFENDA_AUTH_ALL_PLUGINS` is not `"false"` → enable the full Afenda stack
 *   (unless a kill-switch `AFENDA_AUTH_DISABLE_<NAME>=true` is set).
 * - **Legacy opt-in**: set `AFENDA_AUTH_ALL_PLUGINS=false` and use `AFENDA_AUTH_*_ENABLED=true`
 *   for individual plugins (passkey, MFA, magic link, agent auth, Google One Tap).
 */

const ALL_KEY = "AFENDA_AUTH_ALL_PLUGINS"

export function afendaAuthAllPluginsEnabled(): boolean {
  return process.env[ALL_KEY]?.trim() !== "false"
}

export function afendaAuthPluginKillSwitch(name: string): boolean {
  return process.env[`AFENDA_AUTH_DISABLE_${name}`]?.trim() === "true"
}

function legacyEnabled(envName: string): boolean {
  return process.env[envName]?.trim() === "true"
}

/** Passkey / WebAuthn plugin */
export function afendaAuthPasskeyPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("PASSKEY")) return false
  if (afendaAuthAllPluginsEnabled()) return true
  return legacyEnabled("AFENDA_AUTH_PASSKEY_ENABLED")
}

/** TOTP / two-factor plugin */
export function afendaAuthMfaPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("MFA")) return false
  if (afendaAuthAllPluginsEnabled()) return true
  return legacyEnabled("AFENDA_AUTH_MFA_ENABLED")
}

/** Magic link (passwordless email) */
export function afendaAuthMagicLinkPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("MAGIC_LINK")) return false
  if (afendaAuthAllPluginsEnabled()) return true
  return legacyEnabled("AFENDA_AUTH_MAGIC_LINK_ENABLED")
}

/** Agent Auth (capabilities, discovery) */
export function afendaAuthAgentAuthPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("AGENT_AUTH")) return false
  if (afendaAuthAllPluginsEnabled()) return true
  return legacyEnabled("AFENDA_AUTH_AGENT_AUTH_ENABLED")
}

/** Google One Tap — still requires Google OAuth env + client */
export function afendaAuthGoogleOneTapPluginOn(
  hasGoogleOAuth: boolean
): boolean {
  if (!hasGoogleOAuth) return false
  if (afendaAuthPluginKillSwitch("GOOGLE_ONE_TAP")) return false
  if (afendaAuthAllPluginsEnabled()) return true
  return legacyEnabled("AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED")
}

export function afendaAuthUsernamePluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("USERNAME")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthEmailOtpPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("EMAIL_OTP")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthAdminPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("ADMIN")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthApiKeyPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("API_KEY")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthDeviceAuthorizationPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("DEVICE_AUTHORIZATION")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthJwtPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("JWT")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthBearerPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("BEARER")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthLastLoginMethodPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("LAST_LOGIN_METHOD")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthMultiSessionPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("MULTI_SESSION")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthOneTimeTokenPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("ONE_TIME_TOKEN")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthOAuthProxyPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("OAUTH_PROXY")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthGenericOAuthPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("GENERIC_OAUTH")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthCaptchaPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("CAPTCHA")) return false
  return afendaAuthAllPluginsEnabled()
}

/** Better Auth MCP *provider* plugin (not the docs MCP). */
export function afendaAuthMcpProviderPluginOn(): boolean {
  if (afendaAuthPluginKillSwitch("MCP_PLUGIN")) return false
  return afendaAuthAllPluginsEnabled()
}

export function afendaAuthTestUtilsPluginOn(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.AFENDA_AUTH_TEST_UTILS?.trim() === "true"
  )
}
