import { config } from "dotenv"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const DEFAULT_FILENAME = ".env"

/**
 * Resolves the monorepo root from this package location (`packages/env-loader/{src|dist}`).
 */
export function resolveMonorepoRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url))
  return join(here, "../../..")
}

/**
 * Loads a repo-root env file (default `.env`) into `process.env`.
 * Does not override keys already set in the environment.
 * No-op if the file is missing (e.g. CI without secrets).
 */
export function loadMonorepoEnv(
  options: { readonly filename?: string } = {}
): void {
  const filename = options.filename ?? DEFAULT_FILENAME
  const path = join(resolveMonorepoRoot(), filename)
  if (!existsSync(path)) {
    return
  }
  config({ path, override: false })
}

/**
 * Loads repo-root `.env` then `.env.local` (each with `override: false`), matching common override order.
 */
export function loadMonorepoEnvLayered(): void {
  loadMonorepoEnv({ filename: ".env" })
  loadMonorepoEnv({ filename: ".env.local" })
}
