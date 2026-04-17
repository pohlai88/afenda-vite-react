/**
 * Runs `drizzle-kit check` when migration metadata exists.
 * Skips if `drizzle/meta/_journal.json` is absent (no migrations committed yet).
 */
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseRoot = path.join(__dirname, "..")
const journalPath = path.join(databaseRoot, "drizzle", "meta", "_journal.json")

if (!fs.existsSync(journalPath)) {
  console.log(
    "[db:check-migrations] Skipping: no drizzle/meta/_journal.json — commit an initial migration to enable Kit checks."
  )
  process.exit(0)
}

execSync("pnpm exec drizzle-kit check", {
  cwd: databaseRoot,
  stdio: "inherit",
  env: { ...process.env },
})
