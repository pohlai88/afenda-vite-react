/**
 * Documents authority boundaries for this package’s token pipeline.
 *
 * Purpose:
 * - make ownership explicit
 * - point maintainers to the canonical token pipeline
 *
 * Rules:
 * - `@afenda/design-system/tokenization` remains the canonical token authority
 * - this object is documentation metadata only; it does not enforce runtime ownership by itself
 *
 * Enforcement:
 * - Vitest `token-authority-boundaries.test.ts` asserts listed paths exist at monorepo root
 * - Historical deprecated repo paths live in `deprecated-surface.ts` only (see ESLint rule there)
 */
export const TOKEN_AUTHORITY_BOUNDARIES = {
  designSystemTokensImport: '@afenda/design-system/tokenization',
  designSystemTokenizationRoot:
    'packages/design-system/design-architecture/src/tokenization',
} as const
