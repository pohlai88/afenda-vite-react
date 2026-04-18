/**
 * Validates Drizzle-generated migration artifacts under `packages/_database/drizzle/`:
 * - `_journal.json` entries reference existing `*.sql` files (non-empty)
 * - Snapshot files exist per journal entry (Kit naming: `meta/{idx}_snapshot.json`)
 * - `drizzle-kit check` — schema ↔ committed migrations consistency
 *
 * Usage: `pnpm run db:validate-sql` from `packages/_database`
 */
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseRoot = path.join(__dirname, "..")
const drizzleDir = path.join(databaseRoot, "drizzle")
const metaDir = path.join(drizzleDir, "meta")
const journalPath = path.join(metaDir, "_journal.json")

type Journal = {
  entries?: Array<{ idx: number; tag: string }>
}

export function validateDrizzleMigrationArtifacts(): void {
  const raw = fs.readFileSync(journalPath, "utf8")
  const journal = JSON.parse(raw) as Journal
  const entries = journal.entries ?? []
  if (entries.length === 0) {
    throw new Error(
      "validate-drizzle-sql: _journal.json has no entries — run drizzle-kit generate or restore journal"
    )
  }

  for (const e of entries) {
    const sqlPath = path.join(drizzleDir, `${e.tag}.sql`)
    if (!fs.existsSync(sqlPath)) {
      throw new Error(
        `validate-drizzle-sql: journal references ${e.tag}.sql but file is missing: ${sqlPath}`
      )
    }
    const stat = fs.statSync(sqlPath)
    if (stat.size === 0) {
      throw new Error(`validate-drizzle-sql: empty migration file: ${sqlPath}`)
    }

    const snapName = `${String(e.idx).padStart(4, "0")}_snapshot.json`
    const snapPath = path.join(metaDir, snapName)
    if (!fs.existsSync(snapPath)) {
      throw new Error(
        `validate-drizzle-sql: missing snapshot for journal idx ${e.idx}: ${snapPath}`
      )
    }
  }

  const sqlOnDisk = fs.readdirSync(drizzleDir).filter((n) => n.endsWith(".sql"))
  const tagged = new Set(entries.map((e) => `${e.tag}.sql`))
  const stray = sqlOnDisk.filter((f) => !tagged.has(f))
  if (stray.length > 0) {
    throw new Error(
      `validate-drizzle-sql: stray SQL files not listed in _journal.json: ${stray.join(", ")}`
    )
  }

  console.log(
    `[db:validate-sql] Artifacts ok (${entries.length} migration(s)); running drizzle-kit check…`
  )
}

export function runDrizzleKitCheck(): void {
  execSync("pnpm exec drizzle-kit check", {
    cwd: databaseRoot,
    stdio: "inherit",
    env: { ...process.env },
  })
}

/** Full validation: artifact checks + `drizzle-kit check`. Exits 0 if no journal (same as legacy check-migrations). */
export function runValidateDrizzleSql(): void {
  if (!fs.existsSync(journalPath)) {
    console.log(
      "[db:validate-sql] Skipping: no drizzle/meta/_journal.json (generate migrations first)."
    )
    process.exit(0)
  }
  validateDrizzleMigrationArtifacts()
  runDrizzleKitCheck()
  console.log("[db:validate-sql] ok")
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1]!)).href

if (isMain) {
  runValidateDrizzleSql()
}
