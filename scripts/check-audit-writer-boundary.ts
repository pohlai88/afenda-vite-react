/**
 * Fails if `audit_logs` rows are inserted outside the canonical writer module.
 * Run from repo root: `pnpm exec tsx scripts/check-audit-writer-boundary.ts`
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..")
const databaseSrc = join(root, "packages", "_database", "src")
const allowedSuffix = join("7w1h-audit", "services", "insert-audit-log.ts")

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      out.push(...walk(p))
    } else if (p.endsWith(".ts")) {
      out.push(p)
    }
  }
  return out
}

const violations: string[] = []

for (const file of walk(databaseSrc)) {
  if (file.replace(/\\/g, "/").endsWith(allowedSuffix.replace(/\\/g, "/"))) {
    continue
  }
  const text = readFileSync(file, "utf8")
  if (/\binsert\s*\(\s*auditLogs\s*\)/.test(text)) {
    violations.push(file)
  }
}

if (violations.length > 0) {
  console.error(
    "audit_logs insert drift: use insertAuditLog / insertGovernedAuditLog from insert-audit-log.ts only.\n" +
      violations.join("\n")
  )
  process.exit(1)
}

console.info("audit writer boundary: OK")
