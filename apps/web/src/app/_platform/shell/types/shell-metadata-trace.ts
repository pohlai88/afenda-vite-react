/**
 * Lightweight provenance for shell metadata resolution (debugging, tooling).
 */

export interface ShellMetadataTrace {
  /** Pathname of the `UIMatch` that supplied `handle.shell` when resolved from handle. */
  readonly matchedPath: string
  /**
   * Index in `useMatches()` for the match that resolved `handle.shell` (object or explicit `null`).
   * `null` when no match defined `handle.shell` at all.
   */
  readonly resolvedMatchIndex: number | null
  /** Distance from the leaf match (0 = leaf). */
  readonly resolutionDepth: number
  /** When the location matches a row in `shellRouteMetadataList` by canonical `path`. */
  readonly registeredRouteId?: string
  /** Set when the deepest explicit `handle.shell` is `null` (no shell chrome). */
  readonly explicitNoShell?: boolean
}
