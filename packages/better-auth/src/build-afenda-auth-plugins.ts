import { agentAuth } from "@better-auth/agent-auth"
import { apiKey } from "@better-auth/api-key"
import { passkey } from "@better-auth/passkey"
import { dash } from "@better-auth/infra"
import { betterAuth } from "better-auth"
import {
  admin,
  bearer,
  captcha,
  deviceAuthorization,
  emailOTP,
  genericOAuth,
  jwt,
  lastLoginMethod,
  magicLink,
  mcp,
  multiSession,
  oAuthProxy,
  oneTap,
  oneTimeToken,
  organization,
  testUtils,
  twoFactor,
  username,
} from "better-auth/plugins"

import {
  afendaAuthAdminPluginOn,
  afendaAuthAgentAuthPluginOn,
  afendaAuthApiKeyPluginOn,
  afendaAuthBearerPluginOn,
  afendaAuthCaptchaPluginOn,
  afendaAuthDeviceAuthorizationPluginOn,
  afendaAuthEmailOtpPluginOn,
  afendaAuthGenericOAuthPluginOn,
  afendaAuthGoogleOneTapPluginOn,
  afendaAuthJwtPluginOn,
  afendaAuthLastLoginMethodPluginOn,
  afendaAuthMagicLinkPluginOn,
  afendaAuthMcpProviderPluginOn,
  afendaAuthMfaPluginOn,
  afendaAuthMultiSessionPluginOn,
  afendaAuthOAuthProxyPluginOn,
  afendaAuthOneTimeTokenPluginOn,
  afendaAuthPasskeyPluginOn,
  afendaAuthTestUtilsPluginOn,
  afendaAuthUsernamePluginOn,
} from "./afenda-auth-plugin-flags.js"
import {
  sendMagicLinkEmail,
  sendVerificationOtpEmail,
} from "./afenda-resend-mail.js"

export interface BuildAfendaAuthPluginsContext {
  readonly baseURL: string
  readonly rpId: string
  readonly socialProviders: Record<
    string,
    { clientId: string; clientSecret: string }
  >
  readonly betterAuthInfraKey: string | undefined
}

function parseGenericOAuthConfigFromEnv():
  | {
      readonly providerId: string
      readonly clientId: string
      readonly clientSecret: string
      readonly discoveryUrl?: string
    }[]
  | null {
  const raw = process.env.AFENDA_AUTH_GENERIC_OAUTH_JSON?.trim()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed as {
      providerId: string
      clientId: string
      clientSecret: string
      discoveryUrl?: string
    }[]
  } catch {
    console.warn(
      "[afenda/auth] AFENDA_AUTH_GENERIC_OAUTH_JSON is not valid JSON — skipping genericOAuth"
    )
    return null
  }
}

/**
 * Full `testUtils()` options — see https://www.better-auth.com/docs/plugins/test-utils
 * (`captureOTP`, factories, `ctx.test`, etc.).
 * `captureOTP` defaults to `true` when the plugin is enabled so integration tests can use
 * `ctx.test.getOTP()` with `emailOTP` without mocking mail. Set `AFENDA_AUTH_TEST_UTILS_CAPTURE_OTP=false` to disable.
 */
function resolveAfendaTestUtilsPluginOptions(): { captureOTP: boolean } {
  return {
    captureOTP:
      process.env.AFENDA_AUTH_TEST_UTILS_CAPTURE_OTP?.trim() !== "false",
  }
}

function captchaPluginFromEnv() {
  const provider = process.env.AFENDA_AUTH_CAPTCHA_PROVIDER?.trim() as
    | "cloudflare-turnstile"
    | "google-recaptcha"
    | "hcaptcha"
    | "captchafox"
    | undefined
  const secretKey = process.env.AFENDA_AUTH_CAPTCHA_SECRET_KEY?.trim()
  if (!provider || !secretKey) {
    return null
  }
  if (provider === "cloudflare-turnstile") {
    return captcha({
      provider: "cloudflare-turnstile",
      secretKey,
    })
  }
  if (provider === "google-recaptcha") {
    return captcha({
      provider: "google-recaptcha",
      secretKey,
    })
  }
  if (provider === "hcaptcha") {
    return captcha({
      provider: "hcaptcha",
      secretKey,
      siteKey: process.env.AFENDA_AUTH_CAPTCHA_SITE_KEY?.trim(),
    })
  }
  if (provider === "captchafox") {
    return captcha({
      provider: "captchafox",
      secretKey,
      siteKey: process.env.AFENDA_AUTH_CAPTCHA_SITE_KEY?.trim(),
    })
  }
  return null
}

/**
 * Builds the Better Auth `plugins` array for Afenda (order matters for some dependencies:
 * organization before API keys; admin after organization).
 */
export function buildAfendaAuthPlugins(ctx: BuildAfendaAuthPluginsContext) {
  const google = ctx.socialProviders.google
  const genericConfigs = parseGenericOAuthConfigFromEnv()

  const plugins: unknown[] = [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ]

  if (afendaAuthAdminPluginOn()) {
    plugins.push(
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
      })
    )
  }

  if (afendaAuthApiKeyPluginOn()) {
    plugins.push(apiKey())
  }

  if (afendaAuthUsernamePluginOn()) {
    plugins.push(username())
  }

  // Register before `emailOTP` so `captureOTP` hooks attach as documented (test-utils + email OTP).
  if (afendaAuthTestUtilsPluginOn()) {
    plugins.push(testUtils(resolveAfendaTestUtilsPluginOptions()))
  }

  if (afendaAuthEmailOtpPluginOn()) {
    plugins.push(
      emailOTP({
        sendVerificationOTP: async ({ email, otp, type }) => {
          await sendVerificationOtpEmail({ to: email, otp, type })
        },
      })
    )
  }

  if (afendaAuthMagicLinkPluginOn()) {
    plugins.push(
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail({ to: email, url })
        },
      })
    )
  }

  if (afendaAuthMfaPluginOn()) {
    plugins.push(
      twoFactor({
        issuer: process.env.AFENDA_AUTH_MFA_ISSUER?.trim() || "Afenda",
      })
    )
  }

  if (afendaAuthPasskeyPluginOn()) {
    plugins.push(
      passkey({
        rpID: ctx.rpId,
        rpName: process.env.AFENDA_AUTH_PASSKEY_RP_NAME?.trim() || "Afenda",
        origin: ctx.baseURL,
        authentication: {
          extensions: { credProps: true },
        },
      })
    )
  }

  if (afendaAuthLastLoginMethodPluginOn()) {
    plugins.push(lastLoginMethod())
  }

  if (afendaAuthMultiSessionPluginOn()) {
    plugins.push(multiSession())
  }

  if (afendaAuthJwtPluginOn()) {
    const audRaw = process.env.AFENDA_AUTH_JWT_AUDIENCE?.trim()
    const audience = audRaw
      ? audRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined
    plugins.push(
      jwt({
        jwt: {
          issuer: process.env.AFENDA_AUTH_JWT_ISSUER?.trim() || ctx.baseURL,
          ...(audience && audience.length === 1
            ? { audience: audience[0] }
            : audience && audience.length > 1
              ? { audience }
              : {}),
        },
      })
    )
  }

  if (afendaAuthBearerPluginOn()) {
    plugins.push(bearer())
  }

  // OAuth 2.0 RFC 8628 `deviceAuthorization()` and `@better-auth/agent-auth` both register `POST /device/code`.
  if (
    afendaAuthDeviceAuthorizationPluginOn() &&
    !afendaAuthAgentAuthPluginOn()
  ) {
    plugins.push(
      deviceAuthorization({
        verificationUri:
          process.env.AFENDA_AUTH_DEVICE_VERIFICATION_URI?.trim() || "/device",
      })
    )
  }

  if (afendaAuthOneTimeTokenPluginOn()) {
    plugins.push(oneTimeToken())
  }

  if (afendaAuthOAuthProxyPluginOn()) {
    plugins.push(
      oAuthProxy({
        productionURL:
          process.env.AFENDA_AUTH_OAUTH_PROXY_PRODUCTION_URL?.trim() ||
          ctx.baseURL,
        currentURL: process.env.AFENDA_AUTH_OAUTH_PROXY_CURRENT_URL?.trim(),
      })
    )
  }

  if (
    afendaAuthGenericOAuthPluginOn() &&
    genericConfigs &&
    genericConfigs.length > 0
  ) {
    plugins.push(genericOAuth({ config: genericConfigs }))
  }

  if (afendaAuthCaptchaPluginOn()) {
    const c = captchaPluginFromEnv()
    if (c) {
      plugins.push(c)
    } else {
      const provider = process.env.AFENDA_AUTH_CAPTCHA_PROVIDER?.trim()
      const secret = process.env.AFENDA_AUTH_CAPTCHA_SECRET_KEY?.trim()
      if (provider && !secret && process.env.NODE_ENV !== "production") {
        console.warn(
          "[afenda/auth] AFENDA_AUTH_CAPTCHA_PROVIDER is set but AFENDA_AUTH_CAPTCHA_SECRET_KEY is missing — skipping captcha plugin."
        )
      }
    }
  }

  if (afendaAuthMcpProviderPluginOn()) {
    plugins.push(
      mcp({
        loginPage:
          process.env.AFENDA_AUTH_MCP_LOGIN_PAGE?.trim() || "/auth/login",
        resource: process.env.AFENDA_AUTH_MCP_RESOURCE?.trim(),
      })
    )
  }

  if (ctx.betterAuthInfraKey) {
    plugins.push(
      dash({
        apiKey: ctx.betterAuthInfraKey,
      })
    )
  }

  if (afendaAuthAgentAuthPluginOn()) {
    plugins.push(
      agentAuth({
        providerName:
          process.env.AFENDA_AUTH_AGENT_PROVIDER_NAME?.trim() || "Afenda",
        providerDescription:
          process.env.AFENDA_AUTH_AGENT_PROVIDER_DESCRIPTION?.trim() ||
          "Afenda platform — agent discovery, grants, and scoped capability execution.",
        modes: ["delegated", "autonomous"],
        deviceAuthorizationPage:
          process.env.AFENDA_AUTH_AGENT_DEVICE_AUTHORIZATION_PAGE?.trim() ||
          "/device/capabilities",
        ...(process.env.AFENDA_AUTH_AGENT_TRUST_PROXY === "true"
          ? { trustProxy: true }
          : {}),
        capabilities: [
          {
            name: "afenda.ping",
            description:
              "Connectivity check for Agent Auth (no side effects). Optional string `message` is echoed.",
            input: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        ],
        async onExecute({ capability, arguments: args }) {
          if (capability === "afenda.ping") {
            const msg = args?.message
            return {
              ok: true,
              echo: typeof msg === "string" && msg.length > 0 ? msg : null,
            }
          }
          throw new Error(`Unsupported capability: ${capability}`)
        },
      })
    )
  }

  if (afendaAuthGoogleOneTapPluginOn(Boolean(google)) && google) {
    plugins.push(
      oneTap({
        clientId: google.clientId,
      })
    )
  }

  return plugins as NonNullable<Parameters<typeof betterAuth>[0]["plugins"]>
}
