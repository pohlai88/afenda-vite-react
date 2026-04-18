/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Zod v4 helpers for stringly-typed numeric configuration (forms, query strings); complements `readOptionalInteger` in `./env.ts`. Not Drizzle DDL; `.schema.ts` may satisfy `guard-schema-modules.ts` when present. Keep wording generic for `helper-boundary.test.ts`. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Isolation and immutability conventions align with `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * DDL graph or constraint changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/helpers/env-boundary.schema.ts` — `optionalCoercedIntegerSchema` and `optionalIntegerWithDefault`.
 */
import { z } from "zod"

const tokenOrEmpty = z
  .string()
  .refine((s) => s === "" || /^-?\d+$/u.test(s), {
    error: "Must be a base-10 integer",
  })

export const optionalCoercedIntegerSchema = z.preprocess(
  (v) => {
    if (v === undefined || v === null) return ""
    return String(v).trim()
  },
  tokenOrEmpty
).transform((s) => {
  if (s === "") return undefined
  const n = Number.parseInt(s, 10)
  return Number.isSafeInteger(n) ? n : undefined
})

/**
 * Like {@link optionalCoercedIntegerSchema} but supplies `fallback` when the value is absent or invalid.
 */
export function optionalIntegerWithDefault(fallback: number) {
  return optionalCoercedIntegerSchema.transform((n) => n ?? fallback)
}
