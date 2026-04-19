#!/usr/bin/env node
/* global console, process */
/**
 * Enforces a shallow `apps/web/` root (locked policy).
 *
 * - Product: `src/`, `public/`
 * - E2E (Playwright only): `e2e/`
 * - Tooling (dev/CI/release): `scripts/`
 * - TypeScript project fragments: `config/`
 * - Build contract (Vite): `dist/` (gitignored)
 * - Noise bucket (gitignored): `.artifacts/` (Playwright, Vitest, ESLint cache, analyze temp, …)
 * - `node_modules/` — pnpm install output (never committed; not removed by `clean`).
 * - `.turbo/` — Turborepo local cache (removed by `pnpm run clean` in this package).
 * - Env: only `.env.example` at package root — app uses **repo-root** `.env` (no `.env.local` here).
 *
 * @see package.json script `verify:layout`
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, "..")

/** Directory names allowed at `apps/web/` top level. */
const ALLOWED_DIRS = new Set([
  "src",
  "public",
  "e2e",
  "scripts",
  "config",
  ".artifacts",
  "dist",
  "node_modules",
  ".turbo",
])

const ALLOWED_FILE_NAMES = new Set([
  "package.json",
  "index.html",
  "README.md",
  "components.json",
  "tsconfig.json",
  "vite.config.ts",
  "playwright.config.ts",
  "vitest.setup.ts",
])

/**
 * @param {string} name
 */
function isAllowedFile(name) {
  if (ALLOWED_FILE_NAMES.has(name)) return true
  /** Template only; runtime env is repo-root `.env` (see Vite `envDir`). */
  if (name === ".env.example") return true
  return false
}

const entries = fs.readdirSync(webRoot, { withFileTypes: true })
const violations = []

for (const ent of entries) {
  const name = ent.name
  if (ent.isDirectory()) {
    if (!ALLOWED_DIRS.has(name)) {
      violations.push(`unexpected directory: ${name}/`)
    }
  } else if (ent.isFile()) {
    if (!isAllowedFile(name)) {
      violations.push(`unexpected file: ${name}`)
    }
  } else {
    violations.push(`unexpected entry: ${name}`)
  }
}

if (violations.length > 0) {
  console.error("apps/web: root layout policy violation.")
  console.error("Allowed top-level dirs:", [...ALLOWED_DIRS].sort().join(", "))
  console.error(
    "Update scripts/verify-root-layout.mjs if you add an approved config or artifact bucket."
  )
  for (const v of violations) {
    console.error(`  - ${v}`)
  }
  process.exit(1)
}

console.log("apps/web: root layout OK.")
