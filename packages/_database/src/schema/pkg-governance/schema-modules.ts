/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Package governance** — `*.schema.ts` suffix convention for Drizzle DDL modules (parallel to Vitest `*.test.ts`). No DDL. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/pkg-governance/schema-modules.ts` — `DRIZZLE_SCHEMA_MODULE_SUFFIX`, `DRIZZLE_SCHEMA_MODULE_GLOB`, `isDrizzleSchemaModuleFile`.
 */
/**
 * Drizzle schema module naming — parallel to Vitest `*.test.ts`.
 *
 * Prefer a suffix (not a prefix) so:
 * - Grep/glob finds every table/enum/view definition (globstar + `*.schema.ts`).
 * - The domain stays in the path (`authorization/schema/roles.schema.ts`), like tests under `__tests__/`.
 * - Prefixes like `schema-roles.ts` duplicate the `schema/` folder name.
 *
 * Apply to files whose main job is `pgTable`, `pgEnum`, `pgSchema`, `pgView`, etc.
 * Do not rename barrels (`index.ts`), `client.ts`, seeds, or pure utilities.
 *
 * **Barrels / package exports:** `schema/index.ts` and `@afenda/database/schema` re-export symbols only.
 * Callers must not depend on `*.schema.ts` filenames—same idea as other packages: stable public API, internal paths vary.
 *
 * Tests: colocate as `*.schema.test.ts` or keep `__tests__/*.test.ts` importing `../roles.schema.js`.
 */
export const DRIZZLE_SCHEMA_MODULE_SUFFIX = ".schema.ts" as const

/** Glob for tooling (eslint, scripts, Cursor index). Built without a slash-star pair in source. */
export const DRIZZLE_SCHEMA_MODULE_GLOB = "**/*.schema.ts" as const

const SCHEMA_MODULE = /\.schema\.ts$/u

/** True for Drizzle schema modules (not barrels). */
export function isDrizzleSchemaModuleFile(filename: string): boolean {
  return SCHEMA_MODULE.test(filename) && !filename.includes(".test.")
}
