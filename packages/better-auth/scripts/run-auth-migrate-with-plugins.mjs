/**
 * Runs Better Auth CLI `migrate` with passkey + twoFactor enabled so generated
 * schema matches `createAfendaAuth` when those env flags are on. The organization
 * plugin is always part of `createAfendaAuth`; use `auth:migrate` for baseline
 * org + core tables.
 *
 * Usage (from repo root, with DATABASE_URL + BETTER_AUTH_SECRET loaded):
 *   pnpm --filter @afenda/better-auth run auth:migrate:plugins
 */
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.join(__dirname, "..")

const env = {
  ...process.env,
  AFENDA_AUTH_PASSKEY_ENABLED: "true",
  AFENDA_AUTH_MFA_ENABLED: "true",
}

const child = spawn(
  "pnpm",
  [
    "dlx",
    "auth@latest",
    "migrate",
    "--config",
    "./src/better-auth-cli-config.ts",
    "--yes",
  ],
  {
    cwd: pkgRoot,
    env,
    stdio: "inherit",
    shell: true,
  }
)

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1)
  }
  process.exit(code ?? 1)
})
