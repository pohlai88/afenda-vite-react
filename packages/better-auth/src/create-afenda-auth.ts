import { betterAuth } from "better-auth"
import type { Pool } from "pg"

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
 */
export function createAfendaAuth(pool: Pool) {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required")
  }

  const socialProviders = buildSocialProviders()

  return betterAuth({
    database: pool,
    secret,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:5173",
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
  })
}
