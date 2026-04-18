import {
  createDbClient,
  deleteIdentityLinksForBetterAuthUser,
  type DatabaseClient,
} from "@afenda/database"
import { betterAuth } from "better-auth"
import type { Pool } from "pg"

import { buildAfendaAuthPlugins } from "./build-afenda-auth-plugins.js"
import {
  afendaAuthAgentAuthPluginOn,
  afendaAuthAllPluginsEnabled,
  afendaAuthGoogleOneTapPluginOn,
  afendaAuthMagicLinkPluginOn,
  afendaAuthMfaPluginOn,
  afendaAuthPasskeyPluginOn,
} from "./afenda-auth-plugin-flags.js"
import {
  sendChangeEmailConfirmation,
  sendDeleteAccountVerificationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./afenda-resend-mail.js"
import { createAfendaDatabaseAuthHooks } from "./auth-database-audit-hooks.js"

export interface AfendaAuthCapabilityHooks {
  readonly passkeyEnabled: boolean
  readonly mfaEnabled: boolean
  /** Passwordless email link (`magicLink` plugin + Resend `sendMagicLink`). */
  readonly magicLinkEnabled: boolean
  /**
   * [Agent Auth](https://better-auth.com/docs/plugins/agent-auth) — discovery at
   * `/.well-known/agent-configuration` (see `apps/api`).
   */
  readonly agentAuthEnabled: boolean
  /**
   * Application-level policy (not a Better Auth core plugin). When `risk_based`, auth companion
   * intelligence exposes `stepUpPolicy` and may add step-up hints; wire UI using
   * `VITE_AFENDA_AUTH_STEP_UP_POLICY` (injected from `AFENDA_AUTH_STEP_UP_POLICY` in `vite.config`).
   */
  readonly stepUpPolicy: "off" | "risk_based"
  /**
   * [Google One Tap](https://better-auth.com/docs/plugins/one-tap) — requires Google OAuth
   * (`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`) and plugin flags.
   */
  readonly googleOneTapEnabled: boolean
  /** True when `AFENDA_AUTH_ALL_PLUGINS` is not `"false"` (full stack; kill-switches still apply). */
  readonly allPluginsEnabled: boolean
}

export function resolveAfendaAuthCapabilityHooks(): AfendaAuthCapabilityHooks {
  const hasGoogleOAuth =
    Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim())
  const stepUpPolicy =
    process.env.AFENDA_AUTH_STEP_UP_POLICY === "risk_based"
      ? "risk_based"
      : "off"

  return {
    passkeyEnabled: afendaAuthPasskeyPluginOn(),
    mfaEnabled: afendaAuthMfaPluginOn(),
    magicLinkEnabled: afendaAuthMagicLinkPluginOn(),
    agentAuthEnabled: afendaAuthAgentAuthPluginOn(),
    stepUpPolicy,
    googleOneTapEnabled: afendaAuthGoogleOneTapPluginOn(hasGoogleOAuth),
    allPluginsEnabled: afendaAuthAllPluginsEnabled(),
  }
}

/**
 * Public origin(s) the browser uses for Better Auth (cookie + CSRF).
 * With Vite dev, the SPA is `http://localhost:5173` and `/api` proxies to `apps/api`.
 */
function resolveBaseURL(): string {
  const fromEnv = process.env.BETTER_AUTH_URL?.trim()
  if (fromEnv) return fromEnv
  return "http://localhost:5173"
}

/** Extra allowed `Origin` values (CSRF). Defaults cover local Vite + direct API calls. */
function resolvePasskeyRpId(): string {
  const fromEnv = process.env.AFENDA_AUTH_PASSKEY_RP_ID?.trim()
  if (fromEnv) {
    return fromEnv
  }
  try {
    return new URL(resolveBaseURL()).hostname
  } catch {
    return "localhost"
  }
}

/** Default browser origins when `BETTER_AUTH_TRUSTED_ORIGINS` is unset — shared with API CORS (`apps/api`). */
export const DEFAULT_BETTER_AUTH_TRUSTED_ORIGINS: readonly string[] = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
]

function resolveTrustedOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.trim()
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return [...DEFAULT_BETTER_AUTH_TRUSTED_ORIGINS]
}

function buildSocialProviders(): Record<
  string,
  { clientId: string; clientSecret: string }
> {
  const out: Record<string, { clientId: string; clientSecret: string }> = {}
  const add = (key: string, id?: string, secret?: string) => {
    if (id && secret) {
      out[key] = { clientId: id, clientSecret: secret }
    }
  }
  add("apple", process.env.APPLE_CLIENT_ID, process.env.APPLE_CLIENT_SECRET)
  add(
    "facebook",
    process.env.FACEBOOK_CLIENT_ID,
    process.env.FACEBOOK_CLIENT_SECRET
  )
  add("github", process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET)
  add("google", process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  add("vercel", process.env.VERCEL_CLIENT_ID, process.env.VERCEL_CLIENT_SECRET)
  add("zoom", process.env.ZOOM_CLIENT_ID, process.env.ZOOM_CLIENT_SECRET)
  return out
}

/**
 * Validates auth-related env in production. Call from `createAfendaAuth` only.
 * - `BETTER_AUTH_SECRET`: required, min 32 chars
 * - `BETTER_AUTH_URL`: required, `https` unless hostname is `localhost` / `127.0.0.1`
 * - `BETTER_AUTH_TRUSTED_ORIGINS`: warns if unset (defaults are dev-oriented)
 */
function assertBetterAuthProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return
  }
  const secret = process.env.BETTER_AUTH_SECRET?.trim()
  if (!secret || secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set and at least 32 characters in production"
    )
  }
  const base = process.env.BETTER_AUTH_URL?.trim()
  if (!base) {
    throw new Error("BETTER_AUTH_URL is required in production")
  }
  let url: URL
  try {
    url = new URL(base)
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid absolute URL")
  }
  const localHost = url.hostname === "localhost" || url.hostname === "127.0.0.1"
  if (url.protocol !== "https:" && !localHost) {
    throw new Error(
      "BETTER_AUTH_URL must use https in production unless hostname is localhost or 127.0.0.1"
    )
  }
  if (!process.env.BETTER_AUTH_TRUSTED_ORIGINS?.trim()) {
    console.warn(
      "[afenda/auth] BETTER_AUTH_TRUSTED_ORIGINS is unset in production; using DEFAULT_BETTER_AUTH_TRUSTED_ORIGINS — set explicit browser origins for deployment."
    )
  }
}

/** Resend secret keys are issued as `re_…` (see Resend dashboard → API Keys). */
function isLikelyResendApiKey(key: string): boolean {
  const k = key.trim()
  return k.length >= 12 && /^re_[A-Za-z0-9_-]+$/.test(k)
}

/**
 * Fails fast when transactional email must actually send: explicit flag and/or production.
 * Use `AFENDA_AUTH_SKIP_RESEND_ENV_CHECK=true` only for isolated tests / air-gapped images.
 */
function assertAfendaTransactionalEmailEnv(): void {
  const skip = process.env.AFENDA_AUTH_SKIP_RESEND_ENV_CHECK?.trim() === "true"
  const requireExplicit =
    process.env.AFENDA_AUTH_REQUIRE_EMAIL_DELIVERY?.trim() === "true"
  const requireProduction = process.env.NODE_ENV === "production" && !skip

  if (!requireExplicit && !requireProduction) {
    return
  }

  if (skip && process.env.NODE_ENV === "production") {
    console.warn(
      "[afenda/auth] AFENDA_AUTH_SKIP_RESEND_ENV_CHECK=true — Resend env is not enforced; outbound mail may be dropped."
    )
  }

  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()

  if (!key) {
    throw new Error(
      "RESEND_API_KEY is required for transactional email (set AFENDA_AUTH_REQUIRE_EMAIL_DELIVERY=true and/or run in production, or set AFENDA_AUTH_SKIP_RESEND_ENV_CHECK=true to opt out)."
    )
  }
  if (!isLikelyResendApiKey(key)) {
    throw new Error(
      "RESEND_API_KEY must be a Resend secret key (typically starts with re_). Copy it from https://resend.com/api-keys"
    )
  }
  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL is required for transactional email (e.g. Name <noreply@yourdomain.com> — use a verified domain or Resend’s test sender in non-prod)."
    )
  }
}

/**
 * Better Auth instance sharing the API Postgres pool with `@afenda/database`.
 *
 * **PostgreSQL adapter:** `betterAuth({ database: pool })` uses the same pattern as the
 * [Better Auth PostgreSQL docs](https://better-auth.com/docs/adapters/postgresql): a `pg` `Pool`
 * (here from `createPgPool()` → `DATABASE_URL`). Runtime access goes through Kysely’s Postgres
 * dialect as described upstream.
 *
 * **Drizzle adapter:** we do **not** use `drizzleAdapter` at runtime. The [Drizzle adapter
 * docs](https://better-auth.com/docs/adapters/drizzle) apply to CLI output (`auth:generate` →
 * `src/schema/auth-schema.generated.ts`) and any future switch to `drizzleAdapter`; auth DDL is
 * still applied with **`auth:migrate`**, not `drizzle-kit migrate` for these tables.
 *
 * **Schema:** tables are created in the connection’s effective `search_path` (typically `public`
 * unless you set e.g. `?options=-c%20search_path%3Dauth` on `DATABASE_URL`). Align CLI and runtime:
 * `pnpm --filter @afenda/better-auth run auth:migrate` uses `better-auth-cli-config.ts`, which
 * builds the same pool as the API. After adding plugins, run `auth:migrate:plugins` for the full schema.
 *
 * **CLI / MCP:** `pnpm dlx auth@latest migrate|generate|info --config packages/better-auth/src/better-auth-cli-config.ts`;
 * editor docs MCP: `https://mcp.better-auth.com/mcp` (see repo `.cursor/mcp.json`).
 *
 * Requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` at runtime.
 *
 * Pass the same Drizzle client as the API (`createDbClient(pool)`) so Better Auth
 * `databaseHooks` can emit `audit_logs` via `insertGovernedAuditLog`.
 */
export function createAfendaAuth(pool: Pool, db?: DatabaseClient) {
  assertBetterAuthProductionEnv()
  assertAfendaTransactionalEmailEnv()
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required")
  }
  const databaseClient = db ?? createDbClient(pool)
  const capabilityHooks = resolveAfendaAuthCapabilityHooks()

  const socialProviders = buildSocialProviders()

  const betterAuthInfraKey = process.env.BETTER_AUTH_API_KEY?.trim()

  const requireEmailVerification =
    process.env.AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION === "true"

  if (process.env.NODE_ENV !== "production") {
    const summary = [
      `all-plugins=${capabilityHooks.allPluginsEnabled ? "on" : "off"}`,
      `passkey=${capabilityHooks.passkeyEnabled ? "on" : "off"}`,
      `mfa=${capabilityHooks.mfaEnabled ? "on" : "off"}`,
      `magic-link=${capabilityHooks.magicLinkEnabled ? "on" : "off"}`,
      `agent-auth=${capabilityHooks.agentAuthEnabled ? "on" : "off"}`,
      `step-up=${capabilityHooks.stepUpPolicy}`,
      `infra-dash=${betterAuthInfraKey ? "on" : "off"}`,
      `resend=${process.env.RESEND_API_KEY?.trim() ? "on" : "off"}`,
      `require-email-verify=${requireEmailVerification ? "on" : "off"}`,
      `google-one-tap=${capabilityHooks.googleOneTapEnabled ? "on" : "off"}`,
    ].join(", ")
    console.info(`[afenda/auth] capability hooks: ${summary}`)
  }

  const baseURL = resolveBaseURL()
  const plugins = buildAfendaAuthPlugins({
    baseURL,
    rpId: resolvePasskeyRpId(),
    socialProviders,
    betterAuthInfraKey,
  })

  return betterAuth({
    appName: "Afenda",
    database: pool,
    secret,
    baseURL,
    trustedOrigins: resolveTrustedOrigins(),
    /**
     * Persisted operating lens. Populate only server-side after tenant membership validation;
     * run `pnpm --filter @afenda/better-auth run auth:migrate` after changing this shape.
     */
    session: {
      additionalFields: {
        activeTenantId: {
          type: "string",
          required: false,
          input: false,
        },
        activeMembershipId: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          await sendChangeEmailConfirmation({
            to: user.email,
            newEmail,
            url,
            userName: user.name,
          })
        },
      },
      deleteUser: {
        enabled: true,
        sendDeleteAccountVerification: async ({ user, url }) => {
          await sendDeleteAccountVerificationEmail({
            to: user.email,
            url,
            userName: user.name,
          })
        },
        beforeDelete: async (user) => {
          await deleteIdentityLinksForBetterAuthUser(databaseClient, user.id)
        },
      },
    },
    databaseHooks: createAfendaDatabaseAuthHooks(pool, databaseClient),
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendVerificationEmail({
          to: user.email,
          url,
          userName: user.name,
        })
      },
      sendOnSignUp: true,
      ...(requireEmailVerification ? { sendOnSignIn: true } : {}),
      autoSignInAfterVerification: true,
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification,
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail({
          to: user.email,
          url,
          userName: user.name,
        })
      },
    },
    ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
    plugins,
  })
}
