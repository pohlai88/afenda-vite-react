/**
 * GOVERNANCE — artifact contracts
 *
 * Canonical artifact path and filename contracts for generated design-system outputs.
 *
 * Purpose:
 * - keep generated artifact locations explicit and tool-readable
 * - support CI drift checks, emit scripts, and tests
 * - provide one governance surface for CSS + manifest sidecar expectations
 *
 * Rules:
 * - this file is declarative metadata only
 * - it does not emit files
 * - it does not compute runtime token values
 * - consumers should treat these paths as contracts, not suggestions
 *
 * Canonical artifact:
 * - `canonical` matches `generate-design-system.ts` and `test:generated-drift-check`
 */

const CANONICAL_GENERATED_DIR =
  'packages/design-system/design-architecture/src/generated'

export const GENERATED_THEME_ARTIFACT_CONTRACTS = {
  /**
   * Generator output and files tracked by `test:generated-drift-check`.
   */
  canonical: {
    css: {
      fileName: 'generated-theme.css',
      relativeDirectory: CANONICAL_GENERATED_DIR,
      relativeFilePath: `${CANONICAL_GENERATED_DIR}/generated-theme.css`,
    },
    manifest: {
      fileName: 'generated-theme.manifest.json',
      relativeDirectory: CANONICAL_GENERATED_DIR,
      relativeFilePath: `${CANONICAL_GENERATED_DIR}/generated-theme.manifest.json`,
    },
  },
} as const

export const DESIGN_SYSTEM_ARTIFACT_CONTRACTS = {
  generatedTheme: GENERATED_THEME_ARTIFACT_CONTRACTS,
} as const

/**
 * Flattened convenience exports for tools/tests that only need the primary artifact paths.
 */
export const GENERATED_THEME_CSS_FILE_NAME =
  GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.css.fileName

export const GENERATED_THEME_CSS_RELATIVE_DIRECTORY =
  GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.css.relativeDirectory

export const GENERATED_THEME_CSS_RELATIVE_FILE_PATH =
  GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.css.relativeFilePath

export const GENERATED_THEME_MANIFEST_FILE_NAME =
  GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.manifest.fileName

export const GENERATED_THEME_MANIFEST_RELATIVE_DIRECTORY =
  GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.manifest.relativeDirectory

export const GENERATED_THEME_MANIFEST_RELATIVE_FILE_PATH =
  GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.manifest.relativeFilePath
