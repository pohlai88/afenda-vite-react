/* global process */
/**
 * Runs Better Auth CLI `migrate` with **all** Afenda auth plugins enabled so the
 * generated schema matches `createAfendaAuth` when the full stack is on.
 *
 * Uses `AFENDA_AUTH_ALL_PLUGINS=true` (see `resolveAfendaAuthPluginFlags`) so every
 * plugin that respects that flag is enabled. Optional kill-switches (`AFENDA_AUTH_DISABLE_*`)
 * are cleared here so migrations are never partial.
 *
 * Usage (from repo root, with DATABASE_URL + BETTER_AUTH_SECRET loaded):
 *   pnpm --filter @afenda/better-auth run auth:migrate:plugins
 *
 * Baseline org + core only (no optional plugins):
 *   pnpm --filter @afenda/better-auth run auth:migrate
 */
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.join(__dirname, "..")

const env = {
  ...process.env,
  AFENDA_AUTH_ALL_PLUGINS: "true",
  AFENDA_AUTH_DISABLE_PASSKEY: "",
  AFENDA_AUTH_DISABLE_MFA: "",
  AFENDA_AUTH_DISABLE_MAGIC_LINK: "",
  AFENDA_AUTH_DISABLE_AGENT_AUTH: "",
  AFENDA_AUTH_DISABLE_GOOGLE_ONE_TAP: "",
  AFENDA_AUTH_DISABLE_USERNAME: "",
  AFENDA_AUTH_DISABLE_EMAIL_OTP: "",
  AFENDA_AUTH_DISABLE_ADMIN: "",
  AFENDA_AUTH_DISABLE_API_KEY: "",
  AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION: "",
  AFENDA_AUTH_DISABLE_JWT: "",
  AFENDA_AUTH_DISABLE_BEARER: "",
  AFENDA_AUTH_DISABLE_LAST_LOGIN_METHOD: "",
  AFENDA_AUTH_DISABLE_MULTI_SESSION: "",
  AFENDA_AUTH_DISABLE_ONE_TIME_TOKEN: "",
  AFENDA_AUTH_DISABLE_OAUTH_PROXY: "",
  AFENDA_AUTH_DISABLE_GENERIC_OAUTH: "",
  AFENDA_AUTH_DISABLE_CAPTCHA: "",
  AFENDA_AUTH_DISABLE_MCP_PLUGIN: "",
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
