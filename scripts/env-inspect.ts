/**
 * Lists env keys resolved the same way as Vite (`loadEnv`), from the monorepo root.
 * Does not print values — safe to share logs.
 *
 * Usage: `pnpm run script:env-inspect [mode] [--all]`
 * - Default: `VITE_*` keys only (what the client bundle can see).
 * - `--all`: same prefix as `vite.config` (`loadEnv(..., "")`) — includes many `process.env` keys; noisy.
 */
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const require = createRequire(path.join(repoRoot, "apps/web/package.json"))
const { loadEnv } = require("vite") as typeof import("vite")

const args = process.argv.slice(2).filter((a) => a !== "--all")
const all = process.argv.includes("--all")
const mode = args[0] ?? "development"
const env = all ? loadEnv(mode, repoRoot, "") : loadEnv(mode, repoRoot, "VITE_")

const keys = Object.keys(env).sort()
console.log(
  `loadEnv(mode=${JSON.stringify(mode)}, envDir=${repoRoot}, prefix=${all ? '"" (config)' : '"VITE_" (client)'})`
)
console.log(`${keys.length} keys:\n${keys.join("\n")}`)
