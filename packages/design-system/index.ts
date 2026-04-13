/**
 * Default package entry: tokenization + optional barrels.
 * - Tokens: `@afenda/design-system/tokenization` (same graph as `.`).
 * - UI primitives: `@afenda/design-system/ui-primitives` (React); tree-shake friendly in bundlers.
 * - Shared helpers: `@afenda/design-system/utils` (`cn`, etc.).
 */
export * from "./design-architecture/src/tokenization/index"
export * from "./utils/index"
export * from "./ui-primitives/index"
