/**
 * TOKEN PIPELINE ORDER
 *
 * Single source of truth for the ordered list of source files in the theme compiler chain.
 * Consumed by `token-emit` (generator banner) and re-exported from `pipeline.ts`.
 */

export const TOKENIZATION_PIPELINE_SOURCE_FILES = [
  'token-constants.ts',
  'token-types.ts',
  'token-contract.ts',
  'token-source.ts',
  'token-normalize.ts',
  'token-bridge.ts',
  'token-serialize.ts',
  'token-emit.ts',
] as const

/** Appended after core serialization: shadcn/Tailwind alias blocks and on-disk artifact write. */
export const TOKENIZATION_PIPELINE_ARTIFACT_FILES = [
  'token-tailwind-adapter.ts',
  'scripts/generate-theme-css-artifact.ts',
] as const
