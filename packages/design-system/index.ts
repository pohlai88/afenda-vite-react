/**
 * Package root entry — re-exports `utils` and the full UI primitives barrel.
 * Prefer subpaths when you want a smaller module graph (`package.json` → `"exports"`):
 * `./utils`, `./ui-primitives`, `./icons`, `./hooks`, `./scripts`.
 *
 * Icons are not re-exported here; use `@afenda/design-system/icons` so icon code stays tree-shakeable.
 */
export * from './utils/index'
export * from './ui-primitives/index'
