import { passkey } from "@better-auth/passkey"
import { createDbClient, type DatabaseClient } from "@afenda/database"
import { betterAuth } from "better-auth"
import { organization, twoFactor } from "better-auth/plugins"
import type { Pool } from "pg"

import { createAfendaDatabaseAuthHooks } from "./auth-database-audit-hooks.js"

export interface AfendaAuthCapabilityHooks {
  readonly passkeyEnabled: boolean
  readonly mfaEnabled: boolean
  readonly stepUpPolicy: "off" | "risk_based"
}

export function resolveAfendaAuthCapabilityHooks(): AfendaAuthCapabilityHooks {
  const passkeyEnabled = process.env.AFENDA_AUTH_PASSKEY_ENABLED === "true"
  const mfaEnabled = process.env.AFENDA_AUTH_MFA_ENABLED === "true"
  const stepUpPolicy =
    process.env.AFENDA_AUTH_STEP_UP_POLICY === "risk_based"
      ? "risk_based"
      : "off"

  return {
    passkeyEnabled,
    mfaEnabled,
    stepUpPolicy,
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

function resolveTrustedOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.trim()
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ]
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
 * Better Auth instance sharing the API process Postgres pool with `@afenda/database`.
 * Requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` at runtime.
 *
 * Pass the same Drizzle client as the API (`createDbClient(pool)`) so Better Auth
 * `databaseHooks` can emit `audit_logs` via `insertGovernedAuditLog`.
 */
export function createAfendaAuth(pool: Pool, db?: DatabaseClient) {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required")
  }
  const databaseClient = db ?? createDbClient(pool)
  const capabilityHooks = resolveAfendaAuthCapabilityHooks()

  const socialProviders = buildSocialProviders()

  if (process.env.NODE_ENV !== "production") {
    const summary = [
      `passkey=${capabilityHooks.passkeyEnabled ? "on" : "off"}`,
      `mfa=${capabilityHooks.mfaEnabled ? "on" : "off"}`,
      `step-up=${capabilityHooks.stepUpPolicy}`,
    ].join(", ")
    console.info(`[afenda/auth] capability hooks: ${summary}`)
  }

  const plugins = [
    organization({
      allowUserToCreateOrganization: true,
    }),
    ...(capabilityHooks.passkeyEnabled
      ? [
          passkey({
            rpID: resolvePasskeyRpId(),
            rpName: process.env.AFENDA_AUTH_PASSKEY_RP_NAME?.trim() || "Afenda",
            origin: resolveBaseURL(),
          }),
        ]
      : []),
    ...(capabilityHooks.mfaEnabled
      ? [
          twoFactor({
            issuer: process.env.AFENDA_AUTH_MFA_ISSUER?.trim() || "Afenda",
          }),
        ]
      : []),
  ]

  return betterAuth({
    appName: "Afenda",
    database: pool,
    secret,
    baseURL: resolveBaseURL(),
    trustedOrigins: resolveTrustedOrigins(),
    /**
     * Persisted operating lens (ADR-0006). Populate only server-side after membership validation;
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
        activeLegalEntityId: {
          type: "string",
          required: false,
          input: false,
        },
        activeBusinessUnitId: {
          type: "string",
          required: false,
          input: false,
        },
        activeLocationId: {
          type: "string",
          required: false,
          input: false,
        },
        activeOrgUnitId: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
    databaseHooks: createAfendaDatabaseAuthHooks(pool, databaseClient),
    emailAndPassword: {
      enabled: true,
      // Replace with your mailer in production (Resend, SES, …). Dev: log the link for manual testing.
      sendResetPassword: async ({ user, url }) => {
        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[afenda/auth] Password reset link for ${user.email}: ${url}`
          )
        }
      },
    },
    ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
    plugins,
  })
}
