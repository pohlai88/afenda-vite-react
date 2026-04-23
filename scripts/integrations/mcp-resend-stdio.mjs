/**
 * Cursor MCP stdio bridge: loads repo-root `.env` and runs the official Resend MCP server.
 * Keeps secrets out of `mcp.json` — only this process reads `.env`.
 *
 * @see https://resend.com/docs/mcp-server
 */
import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..", "..")

function parseEnvFile(filePath) {
  /** @type {Record<string, string>} */
  const out = {}
  if (!existsSync(filePath)) {
    return out
  }
  const txt = readFileSync(filePath, "utf8")
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#")) {
      continue
    }
    const eq = t.indexOf("=")
    if (eq <= 0) {
      continue
    }
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const fileEnv = parseEnvFile(path.join(repoRoot, ".env"))
const apiKey = fileEnv.RESEND_API_KEY ?? process.env.RESEND_API_KEY ?? ""
const sender =
  fileEnv.RESEND_FROM_EMAIL ??
  process.env.SENDER_EMAIL_ADDRESS ??
  process.env.RESEND_FROM_EMAIL ??
  ""

if (!apiKey.trim()) {
  console.error(
    "[mcp-resend] RESEND_API_KEY missing: set it in repo-root .env (or environment)."
  )
  process.exit(1)
}

const env = {
  ...process.env,
  RESEND_API_KEY: apiKey.trim(),
  ...(sender.trim() ? { SENDER_EMAIL_ADDRESS: sender.trim() } : {}),
}

const child = spawn("npx", ["-y", "resend-mcp"], {
  cwd: repoRoot,
  stdio: "inherit",
  env,
  shell: true,
})

child.on("error", (err) => {
  console.error("[mcp-resend] failed to spawn resend-mcp:", err)
  process.exit(1)
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1)
  }
  process.exit(code ?? 0)
})
