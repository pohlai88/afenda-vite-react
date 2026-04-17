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
