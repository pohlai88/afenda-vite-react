/**
 * Truncates Afenda Drizzle-modeled tables using drizzle-seed `reset()`.
 * Destructive — only for disposable local databases.
 *
 * Requires:
 *   SEED_RESET_LOCAL=true
 *   SEED_ENV=local (or inferred local — see resolveSeedEnvironment)
 *
 * Usage (repo root):
 *   SEED_RESET_LOCAL=true pnpm db:reset:local
 */
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

import {
  afendaDrizzleSchema,
  closeDbPool,
  createDbClient,
  createPgPool,
} from "../src/client"
import { drizzleReset } from "../src/seeds/drizzle-seed-config"
import { resolveSeedEnvironment } from "../src/seeds/policy"

loadMonorepoEnvLayered()

const url = process.env.DATABASE_URL
if (!url) {
  console.error(
    "[reset-local-db] DATABASE_URL is not set. Load .env / .env.neon."
  )
  process.exit(1)
}

if (process.env.SEED_RESET_LOCAL !== "true") {
  console.error(
    "[reset-local-db] Refusing to run. Set SEED_RESET_LOCAL=true for this disposable-database-only tool."
  )
  process.exit(1)
}

const env = resolveSeedEnvironment()
if (env !== "local") {
  console.error(
    `[reset-local-db] Refusing to run in environment "${env}". Use SEED_ENV=local only.`
  )
  process.exit(1)
}

const pool = createPgPool()
const db = createDbClient(pool)

try {
  await drizzleReset(db, afendaDrizzleSchema)
  console.log("[reset-local-db] drizzle-seed reset completed for Afenda schema.")
} finally {
  await closeDbPool(pool)
}
