/**
 * Prints first active `mdm.tenants.id` UUID for repo-root `.env` `DEMO_TENANT_ID`.
 *
 * Usage (repo root): `pnpm -C packages/_database exec tsx scripts/pick-demo-tenant-id.ts`
 */
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

import { createPgPool } from "../src/client"

loadMonorepoEnvLayered()

const pool = createPgPool({ max: 1 })
try {
  const r = await pool.query<{ id: string }>(
    `select id::text as id from mdm.tenants
     where coalesce(is_deleted, false) = false
     order by created_at asc nulls last
     limit 1`
  )
  const id = r.rows[0]?.id
  if (!id) {
    console.error(
      "No rows in mdm.tenants — run migrations / seed a tenant first."
    )
    process.exit(2)
  }
  console.log(id)
} catch (e) {
  console.error(e instanceof Error ? e.message : e)
  process.exit(3)
} finally {
  await pool.end()
}
