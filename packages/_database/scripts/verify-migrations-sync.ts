/**
 * After `drizzle-kit generate`, there must be no uncommitted changes under `drizzle/`.
 * Skips when `drizzle/meta/_journal.json` is missing (initial migration not committed yet).
 */
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseRoot = path.join(__dirname, "..")
const repoRoot = path.join(databaseRoot, "..", "..")
const journalPath = path.join(databaseRoot, "drizzle", "meta", "_journal.json")

if (!fs.existsSync(journalPath)) {
  console.log(
    "[db:verify-migrations-sync] Skipping: no drizzle/meta/_journal.json — Drizzle-generated SQL/meta is not committed (see packages/_database/drizzle/.gitignore)."
  )
  process.exit(0)
}

console.log("[db:verify-migrations-sync] Running drizzle-kit generate…")
execSync("pnpm exec drizzle-kit generate", {
  cwd: databaseRoot,
  stdio: "inherit",
  env: { ...process.env, CI: "true" },
})

console.log(
  "[db:verify-migrations-sync] Checking git diff for packages/_database/drizzle …"
)
execSync("git diff --exit-code -- packages/_database/drizzle", {
  cwd: repoRoot,
  stdio: "inherit",
})

console.log(
  "[db:verify-migrations-sync] ok — committed migrations match the Drizzle schema."
)
