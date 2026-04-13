/**
 * Barrel for build-time scripts and artifact emitters (`generate-theme-css-artifact`, etc.).
 * Pure token pipeline modules live under `@afenda/design-system/tokenization`.
 *
 * Import governance (CLI, not re-exported — running it is a side effect):
 * `pnpm --filter @afenda/design-system run check:imports` → `./check-design-system-imports.ts`
 */

export * from './generate-theme-css-artifact'
