/**
 * SHELL ROUTE METADATA CONTRACT
 *
 * Route modules declare this shape; the router attaches only `shell` to
 * `handle` (see `types/shell-route-handle.ts`). `routeId` and `path` stay on
 * the definition for docs, tooling, and future route tables.
 */

import type { ShellMetadata } from "./shell-metadata-contract"

export interface ShellRouteMetadata {
  /** Stable route identity (sidebar, analytics, debugging). */
  readonly routeId: string

  /**
   * Canonical URL for this route (absolute, as in the browser).
   * May duplicate React Router `path` when composed from segments.
   */
  readonly path: string

  /** Title + breadcrumb trail for shell chrome. */
  readonly shell: ShellMetadata
}
