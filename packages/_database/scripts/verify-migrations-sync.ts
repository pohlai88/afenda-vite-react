/**
 * After `drizzle-kit generate`, the on-disk `drizzle/` tree must remain byte-for-byte stable.
 * This verifies generator determinism against the current working tree rather than
 * requiring a globally clean git state, which would incorrectly fail during in-progress
 * migration work before commit.
 *
 * Skips when `drizzle/meta/_journal.json` is missing (initial migration not committed yet).
 */
import { execSync } from "node:child_process"
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseRoot = path.join(__dirname, "..")
const drizzleRoot = path.join(databaseRoot, "drizzle")
const journalPath = path.join(databaseRoot, "drizzle", "meta", "_journal.json")

interface DirectorySnapshotEntry {
  readonly relativePath: string
  readonly sha256: string
}

function walkFiles(root: string): string[] {
  const entries: string[] = []

  for (const dirent of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, dirent.name)
    if (dirent.isDirectory()) {
      entries.push(...walkFiles(fullPath))
      continue
    }
    if (dirent.isFile()) {
      entries.push(fullPath)
    }
  }

  return entries
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex")
}

function snapshotDirectory(root: string): DirectorySnapshotEntry[] {
  if (!fs.existsSync(root)) {
    return []
  }

  return walkFiles(root)
    .map((filePath) => ({
      relativePath: path.relative(root, filePath).split(path.sep).join("/"),
      sha256: sha256File(filePath),
    }))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

function diffSnapshots(
  before: readonly DirectorySnapshotEntry[],
  after: readonly DirectorySnapshotEntry[]
): string[] {
  const beforeMap = new Map(before.map((entry) => [entry.relativePath, entry]))
  const afterMap = new Map(after.map((entry) => [entry.relativePath, entry]))
  const allPaths = [
    ...new Set([...beforeMap.keys(), ...afterMap.keys()]),
  ].sort()

  return allPaths.flatMap((relativePath) => {
    const previous = beforeMap.get(relativePath)
    const next = afterMap.get(relativePath)

    if (!previous && next) {
      return [`added ${relativePath}`]
    }
    if (previous && !next) {
      return [`deleted ${relativePath}`]
    }
    if (previous && next && previous.sha256 !== next.sha256) {
      return [`changed ${relativePath}`]
    }
    return []
  })
}

if (!fs.existsSync(journalPath)) {
  console.log(
    "[db:verify-migrations-sync] Skipping: no drizzle/meta/_journal.json — Drizzle-generated SQL/meta is not committed (see packages/_database/drizzle/.gitignore)."
  )
  process.exit(0)
}

const beforeSnapshot = snapshotDirectory(drizzleRoot)

console.log("[db:verify-migrations-sync] Running drizzle-kit generate…")
execSync("pnpm exec drizzle-kit generate", {
  cwd: databaseRoot,
  stdio: "inherit",
  env: { ...process.env, CI: "true" },
})

const afterSnapshot = snapshotDirectory(drizzleRoot)
const drift = diffSnapshots(beforeSnapshot, afterSnapshot)

if (drift.length > 0) {
  console.error(
    [
      "[db:verify-migrations-sync] Detected drift in packages/_database/drizzle after generation.",
      "The committed/generated migration tree is not stable against the current schema.",
      ...drift.map((entry) => `  - ${entry}`),
    ].join("\n")
  )
  process.exit(1)
}

console.log(
  "[db:verify-migrations-sync] ok — current drizzle tree remains stable after generation."
)
