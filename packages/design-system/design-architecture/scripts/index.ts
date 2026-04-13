/**
 * Barrel for build-time scripts and artifact emitters (`generate-theme-css-artifact`, etc.).
 * Pure token pipeline modules live under `@afenda/design-system/tokenization`.
 *
 * Import governance (CLI, not re-exported — running it is a side effect):
 * `pnpm --filter @afenda/design-system run check:imports` → `./check-design-system-imports.ts`
 *
 * Generated theme drift (regenerate + `git diff` on CSS + manifest): `./run-generated-theme-drift-check.ts`
 * via `pnpm run test:generated-drift-check` (see `README.md` in this folder).
 */

export * from './generate-theme-css-artifact'
