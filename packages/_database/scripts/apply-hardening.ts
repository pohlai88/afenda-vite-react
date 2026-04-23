/**
 * Apply `sql/hardening/patch_*.sql` in canonical order using the `pg` driver (no `psql` binary).
 *
 * Requires `DATABASE_URL` (via @afenda/env-loader monorepo .env layering).
 *
 * Usage (from repo root or packages/_database):
 *   pnpm --filter @afenda/database run db:apply-hardening
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { loadMonorepoEnvLayered } from "@afenda/env-loader"
import { Pool } from "pg"

import { HARDENING_PATCH_FILENAMES } from "./verify-hardening-patch-order"

loadMonorepoEnvLayered()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const hardeningDir = path.join(__dirname, "..", "sql", "hardening")

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url?.trim()) {
    console.error(
      "db:apply-hardening: set DATABASE_URL (e.g. in .env at repo root)."
    )
    process.exit(1)
  }

  const pool = new Pool({ connectionString: url })

  try {
    for (const name of HARDENING_PATCH_FILENAMES) {
      const filePath = path.join(hardeningDir, name)
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing patch file: ${filePath}`)
      }
      const sql = fs.readFileSync(filePath, "utf8")
      console.log(`Applying ${name} …`)
      await pool.query(sql)
      console.log(`  ok`)
    }
    console.log("db:apply-hardening: all patches applied.")
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
