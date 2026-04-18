/**
 * Runs Drizzle migrations with **full PostgreSQL errors** on stderr.
 * `drizzle-kit migrate` often hides failures behind a spinner; this uses the same
 * `migrate()` API as Kit with `migrationsSchema` aligned to `drizzle.config.ts`.
 *
 * Usage (from `packages/_database`): `pnpm exec tsx scripts/run-drizzle-migrate.ts`
 * or `pnpm run db:migrate`.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

import { loadMonorepoEnvLayered } from "@afenda/env-loader"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"

import { DRIZZLE_MIGRATIONS_SCHEMA } from "../src/schema/pkg-governance/constants.js"

loadMonorepoEnvLayered()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseRoot = path.join(__dirname, "..")
const migrationsFolder = path.join(databaseRoot, "drizzle")

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url?.trim()) {
    console.error("db:migrate: set DATABASE_URL (e.g. via monorepo .env).")
    process.exit(1)
  }

  const pool = new Pool({ connectionString: url })
  const db = drizzle({ client: pool })

  try {
    await migrate(db, {
      migrationsFolder,
      migrationsSchema: DRIZZLE_MIGRATIONS_SCHEMA,
    })
    console.log("db:migrate: migrations applied successfully.")
  } catch (err) {
    console.error("db:migrate: failed — PostgreSQL / migrator error:")
    if (err && typeof err === "object") {
      const e = err as Error & {
        code?: string
        detail?: string
        hint?: string
        cause?: unknown
      }
      console.error(e.message)
      if (e.code) console.error(`  code: ${e.code}`)
      if (e.detail) console.error(`  detail: ${e.detail}`)
      if (e.hint) console.error(`  hint: ${e.hint}`)
      if (e.cause) console.error("  cause:", e.cause)
      if (e.stack) console.error(e.stack)
    } else {
      console.error(String(err))
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
