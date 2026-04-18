/**
 * Better Auth CLI entry point (`migrate`, `generate`, `info`).
 *
 * Run from repo root with `DATABASE_URL` and `BETTER_AUTH_SECRET` set (e.g. via `.env`):
 *
 * - **Baseline (core + org):**
 *   `pnpm --filter @afenda/better-auth run auth:migrate`
 * - **Full plugin schema (recommended after changing `buildAfendaAuthPlugins`):**
 *   `pnpm --filter @afenda/better-auth run auth:migrate:plugins`
 *   (sets `AFENDA_AUTH_ALL_PLUGINS=true` and clears kill-switches so migrations are not partial.)
 * - **Drizzle types:**
 *   `pnpm --filter @afenda/better-auth run auth:generate`
 * - **Diagnostics:**
 *   `pnpm --filter @afenda/better-auth run auth:info`
 *
 * Editor docs MCP (not the app MCP plugin): `https://mcp.better-auth.com/mcp` — see `.cursor/mcp.json`.
 * CLI helper: `pnpm dlx auth@latest mcp --cursor`
 *
 * Loads repo-root `.env` then `.env.local` (see `loadMonorepoEnvLayered`).
 *
 * Uses the same `createPgPool()` as `apps/api`, so `search_path` / `DATABASE_URL` options match
 * runtime migrations (`auth migrate` inspects the configured schema per Better Auth PostgreSQL docs).
 */
import { createDbClient, createPgPool } from "@afenda/database"
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

import { createAfendaAuth } from "./create-afenda-auth.js"

loadMonorepoEnvLayered()

const pool = createPgPool()
const db = createDbClient(pool)
export const auth = createAfendaAuth(pool, db)
