/**
 * Better Auth CLI entry point (`migrate`, `generate`, `info`).
 *
 * Run from repo root with DATABASE_URL and BETTER_AUTH_SECRET set (e.g. via `.env.neon` or `.env`):
 *
 * `pnpm dlx auth@latest migrate --config packages/better-auth/src/better-auth-cli-config.ts --yes`
 *
 * Loads repo-root `.env.neon` then `.env` (see `loadMonorepoEnvLayered`).
 */
import { createPgPool } from "@afenda/database"
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

import { createAfendaAuth } from "./create-afenda-auth.js"

loadMonorepoEnvLayered()

const pool = createPgPool()
export const auth = createAfendaAuth(pool)
