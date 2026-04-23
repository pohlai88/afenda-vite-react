/**
 * Live PostgreSQL checks (schema + hardening signals). Requires DATABASE_URL after
 * `loadMonorepoEnvLayered()` (repo-root `.env` / `.env.local`). Skipped when unset so CI stays green.
 *
 * Run: `pnpm run test:live-db` from `packages/_database` (or repo root with filter).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { Pool } from "pg"
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

loadMonorepoEnvLayered()

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim())

describe.skipIf(!hasDatabaseUrl)(
  "live DB — connection and hardening signals",
  () => {
    let pool: Pool

    beforeAll(async () => {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 15_000,
      })

      // Warm the first connection so individual assertions do not fail on a cold
      // Postgres handshake when DATABASE_URL is present but slower than Vitest's
      // default per-test timeout.
      await pool.query("select 1")
    }, 20_000)

    afterAll(async () => {
      await pool.end()
    })

    it("connects (SELECT 1)", async () => {
      const r = await pool.query("select 1 as ok")
      expect(r.rows[0]?.ok).toBe(1)
    }, 15_000)

    it("has expected PostgreSQL schemas", async () => {
      const want = ["governance", "iam", "mdm", "ref"]
      const r = await pool.query<{ schema_name: string }>(
        `select schema_name from information_schema.schemata
       where schema_name = any($1::text[])`,
        [want]
      )
      const got = new Set(r.rows.map((x) => x.schema_name))
      for (const s of want) expect(got.has(s), `missing schema ${s}`).toBe(true)
    }, 15_000)

    it("governance trigger helpers exist (patch A)", async () => {
      const r = await pool.query<{ proname: string }>(
        `select p.proname
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'governance'
         and p.proname in ('set_updated_at', 'bump_version_no')`
      )
      const names = new Set(r.rows.map((x) => x.proname))
      expect(names.has("set_updated_at")).toBe(true)
      expect(names.has("bump_version_no")).toBe(true)
    })

    it("mdm.tenants has updated_at / version bump triggers (patch A)", async () => {
      const r = await pool.query<{ tgname: string }>(
        `select t.tgname
       from pg_trigger t
       join pg_class c on c.oid = t.tgrelid
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'mdm' and c.relname = 'tenants' and not t.tgisinternal`
      )
      const names = r.rows.map((x) => x.tgname)
      expect(names.some((n) => n.includes("updated_at"))).toBe(true)
      expect(names.some((n) => n.includes("version"))).toBe(true)
    })

    it("mdm.parties.canonical_name_normalized is stored generated (patch B)", async () => {
      const r = await pool.query<{ attgenerated: string }>(
        `select a.attgenerated
       from pg_attribute a
       join pg_class c on c.oid = a.attrelid
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'mdm' and c.relname = 'parties'
         and a.attname = 'canonical_name_normalized' and not a.attisdropped`
      )
      expect(r.rows[0]?.attgenerated).toBe("s")
    })

    it("btree_gist extension exists (patch H)", async () => {
      const r = await pool.query<{ extname: string }>(
        `select extname from pg_extension where extname = 'btree_gist'`
      )
      expect(r.rows.length).toBeGreaterThan(0)
    })

    it("mdm.parties has RLS enabled (patch L)", async () => {
      const r = await pool.query<{ relrowsecurity: boolean }>(
        `select c.relrowsecurity
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'mdm' and c.relname = 'parties'`
      )
      expect(r.rows[0]?.relrowsecurity).toBe(true)
    })

    it("governance.truth_records has append-only trigger protection (patch O)", async () => {
      const r = await pool.query<{ tgname: string }>(
        `select t.tgname
       from pg_trigger t
       join pg_class c on c.oid = t.tgrelid
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'governance'
         and c.relname = 'truth_records'
         and not t.tgisinternal`
      )
      const names = r.rows.map((x) => x.tgname)
      expect(names).toContain("trg_truth_records_append_only")
    })
  }
)
