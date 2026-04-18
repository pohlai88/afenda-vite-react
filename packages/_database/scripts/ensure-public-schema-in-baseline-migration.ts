/**
 * After `drizzle-kit generate`, the first migration may create `CREATE TYPE "public".*`
 * before `public` exists on minimal Postgres (e.g. some Neon databases). Drizzle orders
 * app schemas first, then enums in `public` — so we prepend `CREATE SCHEMA IF NOT EXISTS "public"`.
 *
 * Idempotent: if the baseline SQL already starts with this guard, the file is unchanged.
 *
 * Usage: `pnpm exec tsx scripts/ensure-public-schema-in-baseline-migration.ts`
 * (wired into `db:generate` after `drizzle-kit generate`).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseRoot = path.join(__dirname, "..")
const drizzleDir = path.join(databaseRoot, "drizzle")
const metaDir = path.join(drizzleDir, "meta")
const journalPath = path.join(metaDir, "_journal.json")

const GUARD = `-- Shared \`pgEnum\` types are emitted under \`public\` (see \`shared/enums.schema.ts\`). Some hosts
-- (minimal DBs / certain Neon setups) have no \`public\` schema until created — create it before any \`CREATE TYPE "public".*\`.
CREATE SCHEMA IF NOT EXISTS "public";
--> statement-breakpoint
`

type Journal = {
  entries?: Array<{ idx: number; tag: string }>
}

function main(): void {
  if (!fs.existsSync(journalPath)) {
    console.log(
      "[ensure-public-schema] Skipping: no drizzle/meta/_journal.json"
    )
    return
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8")) as Journal
  const first = journal.entries?.[0]
  if (!first) {
    console.log("[ensure-public-schema] Skipping: journal has no entries")
    return
  }

  const sqlPath = path.join(drizzleDir, `${first.tag}.sql`)
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`[ensure-public-schema] Missing ${first.tag}.sql`)
  }

  let body = fs.readFileSync(sqlPath, "utf8")
  if (body.includes('CREATE SCHEMA IF NOT EXISTS "public"')) {
    console.log("[ensure-public-schema] ok (already present)")
    return
  }

  if (!body.includes('CREATE TYPE "public".')) {
    console.log(
      "[ensure-public-schema] Skipping: no public-scoped enums in baseline (unexpected)"
    )
    return
  }

  body = GUARD + body
  fs.writeFileSync(sqlPath, body, "utf8")
  console.log(
    `[ensure-public-schema] Prepended public-schema guard to ${path.basename(sqlPath)}`
  )
}

main()
