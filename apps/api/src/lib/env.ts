/**
 * Environment contract: single parse at module load, fail fast at boot.
 * Owns validated `process.env` surface; routes should not read env ad hoc.
 * platform · config · env
 * Upstream: `@afenda/env-loader` (must run before parse); zod catalog.
 * Downstream: `index.ts` listen port; future CORS (`WEB_ORIGIN`).
 * Side effects: `loadMonorepoEnvLayered()` then `process.env` read + parse.
 * Coupling: repo-root `.env` / `.env.local` keys must satisfy schema when set.
 * stable
 * @module lib/env
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
})

export type AppEnvConfig = z.infer<typeof envSchema>

export const env: AppEnvConfig = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT:
    process.env.PORT === undefined || process.env.PORT === ""
      ? undefined
      : process.env.PORT,
  WEB_ORIGIN: process.env.WEB_ORIGIN,
})

export function isProduction(): boolean {
  return env.NODE_ENV === "production"
}
