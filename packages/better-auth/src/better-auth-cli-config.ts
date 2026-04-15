/**
 * Better Auth CLI entry point (`migrate`, `generate`, `info`).
 *
 * Run from repo root with DATABASE_URL and BETTER_AUTH_SECRET set (e.g. via `.env.neon`):
 *
 * `pnpm dlx auth@latest migrate --config packages/better-auth/src/better-auth-cli-config.ts --yes`
 *
 * Loads repo-root `.env.neon` when present so local Neon URLs match `apps/api`.
 */
import { createPgPool } from "@afenda/database"
import { loadMonorepoEnv } from "@afenda/env-loader"

import { createAfendaAuth } from "./create-afenda-auth.js"

loadMonorepoEnv()

const pool = createPgPool()
export const auth = createAfendaAuth(pool)
