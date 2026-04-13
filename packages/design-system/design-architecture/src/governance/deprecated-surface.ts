/**
 * GOVERNANCE — deprecated surface
 *
 * Canonical metadata for deprecated packages, subpaths, and in-repo source paths
 * that are still present for compatibility or migration reasons.
 *
 * Purpose:
 * - make deprecated surfaces explicit and tool-readable
 * - support lint messages, tests, CI checks, and migration docs
 * - centralize replacement guidance instead of scattering it across rules
 *
 * Rules:
 * - this file is declarative metadata only
 * - it does not enforce imports by itself
 * - it does not own runtime behavior
 * - replacement targets should point to canonical non-deprecated surfaces
 */

import { TOKEN_AUTHORITY_BOUNDARIES } from './token-authority-boundaries'

/** Historical path kept for migration metadata. */
const REMOVED_SHADCN_DEPRECATED_THEME_TS =
  'packages/shadcn-ui-deprecated/src/afenda-design-system/theme.ts'

export type DeprecatedSurfaceStatus =
  | 'deprecated'
  | 'compat-only'
  | 'legacy-reference'

export interface DeprecatedSurfaceEntry {
  readonly id: string
  readonly kind: 'package' | 'subpath' | 'repo-path'
  readonly target: string
  readonly status: DeprecatedSurfaceStatus
  readonly replacement?: string
  readonly note: string
}

export const DEPRECATED_SURFACE_ENTRIES = [
  {
    id: 'shadcn-ui-deprecated-package',
    kind: 'package',
    target: '@afenda/shadcn-ui-deprecated',
    status: 'deprecated',
    replacement: '@afenda/design-system/tokenization',
    note: 'Deprecated shadcn registry/theme surface. Prefer the design-system tokenization pipeline for canonical token authority and generated theme outputs.',
  },
  {
    id: 'shadcn-ui-deprecated-theme-ts',
    kind: 'repo-path',
    target: REMOVED_SHADCN_DEPRECATED_THEME_TS,
    status: 'legacy-reference',
    replacement: TOKEN_AUTHORITY_BOUNDARIES.designSystemTokenizationRoot,
    note: 'Former in-repo theme literal path. The deprecated shadcn package is not a canonical design-system authority; use the design-system tokenization pipeline.',
  },
  {
    id: 'tokenization-build-legacy-cluster',
    kind: 'repo-path',
    target: 'packages/design-system/design-architecture/tokenization-build',
    status: 'legacy-reference',
    replacement: 'packages/design-system/design-architecture/src/tokenization',
    note: 'Legacy tokenization-build cluster remains reference-only. Port useful ideas selectively; do not restore it as the active compiler pipeline.',
  },
] as const satisfies readonly DeprecatedSurfaceEntry[]

export const DEPRECATED_SURFACE_MAP = Object.fromEntries(
  DEPRECATED_SURFACE_ENTRIES.map((entry) => [entry.id, entry]),
) as Readonly<
  Record<
    (typeof DEPRECATED_SURFACE_ENTRIES)[number]['id'],
    DeprecatedSurfaceEntry
  >
>

export function getDeprecatedSurfaceById(
  id: DeprecatedSurfaceEntry['id'],
): DeprecatedSurfaceEntry | undefined {
  return DEPRECATED_SURFACE_ENTRIES.find((entry) => entry.id === id)
}

export function getDeprecatedSurfaceByTarget(
  target: string,
): DeprecatedSurfaceEntry | undefined {
  return DEPRECATED_SURFACE_ENTRIES.find((entry) => entry.target === target)
}

export function isDeprecatedSurfaceTarget(target: string): boolean {
  return DEPRECATED_SURFACE_ENTRIES.some((entry) => entry.target === target)
}
