/**
 * SHELL BREADCRUMB CONTRACT
 *
 * Canonical breadcrumb contracts for the platform shell.
 * These contracts define:
 * - the source descriptor shape emitted by shell metadata producers
 * - the resolved render shape consumed by shell breadcrumb UI
 *
 * Rules:
 * - source descriptors must provide stable ids
 * - `labelKey` is translation metadata, not display text
 * - `to` is optional because not every segment is navigable
 * - resolved items must be render-ready and must not require JSX-time policy
 */

export type ShellBreadcrumbKind = "link" | "page"

export interface ShellBreadcrumbDescriptor {
  /**
   * Stable identity owned by the metadata producer (e.g. `UIMatch.id`).
   * Required in production — do not relax except during explicit migration.
   */
  readonly id: string

  /**
   * Translation key in the `shell` namespace.
   */
  readonly labelKey: string

  /**
   * Optional navigation target.
   * The final segment still resolves as a page even when a target exists.
   */
  readonly to?: string
}

export interface ShellBreadcrumbResolvedItem {
  /**
   * Stable identity inherited from the source descriptor.
   */
  readonly id: string

  /**
   * Original translation key retained for traceability.
   */
  readonly labelKey: string

  /**
   * Final translated label ready for rendering.
   */
  readonly label: string

  /**
   * Optional normalized navigation target.
   */
  readonly to?: string

  /**
   * Final render intent for the UI layer.
   */
  readonly kind: ShellBreadcrumbKind

  /**
   * Explicit marker for current-page semantics.
   */
  readonly isCurrentPage: boolean
}

export interface ResolveShellBreadcrumbsOptions {
  readonly pathname: string
  readonly segments: readonly ShellBreadcrumbDescriptor[]
  readonly translate: (labelKey: string) => string
}
