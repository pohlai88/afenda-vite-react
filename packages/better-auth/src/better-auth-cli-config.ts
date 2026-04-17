/**
 * Better Auth CLI entry point (`migrate`, `generate`, `info`).
 *
 * Run from repo root with DATABASE_URL and BETTER_AUTH_SECRET set (e.g. via `.env.neon` or `.env`):
 *
 * `pnpm dlx auth@latest migrate --config packages/better-auth/src/better-auth-cli-config.ts --yes`
 *
 * Organization plugin tables are included whenever you run `auth:migrate`.
 * For passkey + twoFactor plugin tables, enable env flags and run:
 * `pnpm --filter @afenda/better-auth run auth:migrate:plugins`
 *
 * Loads repo-root `.env.neon` then `.env` (see `loadMonorepoEnvLayered`).
 */
import { createDbClient, createPgPool } from "@afenda/database"
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

import { createAfendaAuth } from "./create-afenda-auth.js"

loadMonorepoEnvLayered()

const pool = createPgPool()
const db = createDbClient(pool)
export const auth = createAfendaAuth(pool, db)
