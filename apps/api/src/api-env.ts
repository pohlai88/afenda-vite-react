/**
 * Environment contract: single parse at module load, fail fast at boot.
 * Owns validated `process.env` surface; routes should not read env ad hoc.
 * platform · config · env
 * Upstream: `@afenda/env-loader` (must run before parse); zod catalog.
 * Downstream: `index.ts` listen port; future CORS (`WEB_ORIGIN`).
 * Side effects: `loadMonorepoEnvLayered()` then `process.env` read + parse.
 * Coupling: repo-root `.env` / `.env.local` keys must satisfy schema when set.
 * stable
 * @module api-env
 * @package @afenda/api
 */
import { loadMonorepoEnvLayered } from "@afenda/env-loader"
import { z } from "zod"

loadMonorepoEnvLayered()

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  LEGACY_TPM_API_URL: z.string().url().optional(),
  LEGACY_TPM_API_TOKEN: z.string().min(1).optional(),
  LEGACY_TPM_TENANT_ID: z.string().min(1).optional(),
  LEGACY_MRP_API_URL: z.string().url().optional(),
  LEGACY_MRP_API_TOKEN: z.string().min(1).optional(),
  LEGACY_MRP_TENANT_ID: z.string().min(1).optional(),
})

export type AppEnvConfig = z.infer<typeof envSchema>

export const env: AppEnvConfig = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT:
    process.env.PORT === undefined || process.env.PORT === ""
      ? undefined
      : process.env.PORT,
  WEB_ORIGIN: process.env.WEB_ORIGIN,
  DATABASE_URL: process.env.DATABASE_URL?.trim() || undefined,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET?.trim() || undefined,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL?.trim() || undefined,
  LEGACY_TPM_API_URL: process.env.LEGACY_TPM_API_URL?.trim() || undefined,
  LEGACY_TPM_API_TOKEN: process.env.LEGACY_TPM_API_TOKEN?.trim() || undefined,
  LEGACY_TPM_TENANT_ID: process.env.LEGACY_TPM_TENANT_ID?.trim() || undefined,
  LEGACY_MRP_API_URL: process.env.LEGACY_MRP_API_URL?.trim() || undefined,
  LEGACY_MRP_API_TOKEN: process.env.LEGACY_MRP_API_TOKEN?.trim() || undefined,
  LEGACY_MRP_TENANT_ID: process.env.LEGACY_MRP_TENANT_ID?.trim() || undefined,
})

export function isProduction(): boolean {
  return env.NODE_ENV === "production"
}

export function hasBetterAuthRuntimeEnv(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() &&
    process.env.BETTER_AUTH_SECRET?.trim() &&
    process.env.BETTER_AUTH_URL?.trim()
  )
}

export function assertBetterAuthRuntimeEnv(): void {
  if (hasBetterAuthRuntimeEnv()) {
    return
  }

  throw new Error(
    "Better Auth runtime requires DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL."
  )
}
