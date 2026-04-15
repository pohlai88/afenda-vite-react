/**
 * Confirm Better Auth `public.user` row for an email (same `.env` / `DATABASE_URL` as `apps/api`).
 *
 * Usage (repo root):
 *   pnpm --filter @afenda/database exec tsx scripts/check-auth-user-email.mts you@example.com
 */
import { loadMonorepoEnvLayered } from "@afenda/env-loader"
import pg from "pg"

const email = process.argv[2]?.trim()
if (!email) {
  console.error(
    "Usage: pnpm --filter @afenda/database exec tsx scripts/check-auth-user-email.mts <email>"
  )
  process.exit(1)
}

loadMonorepoEnvLayered()
const url = process.env.DATABASE_URL
if (!url) {
  console.log("NO_DATABASE_URL (set repo-root .env.neon or .env)")
  process.exit(0)
}

const masked = url.replace(/:[^:@/]+@/, ":****@")
console.log("DATABASE_URL (masked):", masked)

const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  const r = await client.query<{ id: string; email: string }>(
    `SELECT id, email FROM public."user" WHERE lower(email) = lower($1)`,
    [email]
  )
  if (r.rows.length === 0) {
    console.log(
      "ROWS: none — email not in public.user for this DATABASE_URL"
    )
  } else {
    console.log("ROWS:", JSON.stringify(r.rows, null, 2))
  }
} finally {
  await client.end()
}
