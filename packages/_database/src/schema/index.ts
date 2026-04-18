/**
 * Public schema barrel: re-exports domain modules via default `index.ts` entrypoints.
 * On-disk DDL uses `*.schema.ts` (human-readable); import through this barrel or `@afenda/database/schema`.
 */
export * from "./finance"
export * from "./governance"
export * from "./iam"
export * from "./mdm"
export * from "./ref"
export * from "./shared"
export * from "../views"
