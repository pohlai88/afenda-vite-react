/**
 * RESPONSIBILITY ENVELOPE
 * File role: root public API barrel for `src/share/components`.
 * Owns: re-exports of curated slice barrels only (`brand`, `block-ui`, `layout`,
 * `navigation`, `providers`, `search`, `shell-ui`).
 * Standard: import runtime values and types from this barrel (path alias to
 * `src/share/components`), or from a slice barrel (e.g. `src/share/components/block-ui`)
 * when you want a narrower surface.
 * Prefer slice barrels over deep file paths; deep imports are for breaking cycles only.
 * Must not own: component implementations, feature logic, or exports that bypass a
 * slice’s `index.ts` and `RULES.md` boundaries.
 * Safe edits: wire a new top-level slice here after it has its own barrel + RULES.
 * Unsafe edits: `export *` from arbitrary paths, features, or internals without a slice home.
 * Related: each slice `index.ts`, each slice `RULES.md`, `docs/PROJECT_STRUCTURE.md`.
 */
export * from './brand'
export * from './block-ui'
export * from './layout'
export * from './navigation'
export * from './providers'
export * from './search'
export * from './shell-ui'
