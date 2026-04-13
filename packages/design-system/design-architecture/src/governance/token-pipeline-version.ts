/**
 * GOVERNANCE — token pipeline version
 *
 * Canonical version metadata for the design-system token pipeline contract.
 *
 * Purpose:
 * - make pipeline contract changes explicit
 * - support CI checks, generator consumers, and migration notes
 * - distinguish pipeline/output contract changes from manifest-schema changes
 *
 * Rules:
 * - this file is declarative metadata only
 * - it does not compute hashes or emit artifacts
 * - bump TOKEN_PIPELINE_VERSION when the pipeline/output contract changes in a meaningful way
 * - do not use this as a package version replacement
 *
 * Relationship:
 * - `manifestSchemaVersion` must stay aligned with `THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION`
 *   in `token-manifest.ts` (manifest JSON shape).
 * - Artifact paths are delegated to `artifact-contracts.ts` so generator outputs stay consistent.
 */

import { GENERATED_THEME_ARTIFACT_CONTRACTS } from './artifact-contracts'
import { TOKEN_AUTHORITY_BOUNDARIES } from './token-authority-boundaries'

export const TOKEN_PIPELINE_VERSION = '1.0.0' as const

/**
 * Versioning policy for the token pipeline contract.
 *
 * major:
 * - breaking changes to emitted artifact structure or public pipeline contract
 * - canonical variable naming changes
 * - section ordering changes in emitted CSS that consumers/tools rely on
 *
 * minor:
 * - additive non-breaking governance or metadata surfaces
 * - additive adapter capabilities
 * - additive manifest fields that do not break existing readers
 *
 * patch:
 * - corrections, clarifications, or internal fixes that preserve the same
 *   consumer-facing pipeline/output contract
 */
export const TOKEN_PIPELINE_VERSION_POLICY = {
  major: 'Breaking pipeline/output contract change.',
  minor: 'Backward-compatible additive pipeline/governance change.',
  patch: 'Non-breaking correction or internal stabilization.',
} as const

/**
 * JSON manifest shape version (bump only when `ThemeArtifactManifest` changes).
 * Keep in sync with `THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION` in `token-manifest.ts`.
 */
export const TOKEN_PIPELINE_MANIFEST_SCHEMA_VERSION = 3 as const

/**
 * Current contract summary.
 *
 * Keep this intentionally small and readable so tools/tests/docs can surface it
 * without pulling in runtime logic.
 */
export const TOKEN_PIPELINE_CONTRACT = {
  version: TOKEN_PIPELINE_VERSION,
  manifestSchemaVersion: TOKEN_PIPELINE_MANIFEST_SCHEMA_VERSION,
  compilerRoot: TOKEN_AUTHORITY_BOUNDARIES.designSystemTokenizationRoot,
  canonicalTokenImport: TOKEN_AUTHORITY_BOUNDARIES.designSystemTokensImport,
  /** Generator output + `test:generated-drift-check` (monorepo-relative). */
  canonicalArtifactCss:
    GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.css.relativeFilePath,
  canonicalArtifactManifest:
    GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.manifest.relativeFilePath,
} as const
