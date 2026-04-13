/**
 * SHELL METADATA CONTRACT
 *
 * Canonical shell metadata contract for platform-level UI consumers.
 * This metadata is emitted by routes or shell-aware feature definitions and is
 * consumed by shell selectors, hooks, and presentational shell components.
 *
 * Rules:
 * - metadata carries translation keys, not resolved labels
 * - metadata must remain declarative
 * - metadata must not contain JSX, component instances, or ad hoc render logic
 * - breadcrumb identity must be source-owned and stable
 * - header actions are declarative descriptors, not runtime handlers
 */

import type { ShellBreadcrumbDescriptor } from "./shell-breadcrumb-contract"
import type { ShellHeaderActionDescriptor } from "./shell-header-action-contract"

export interface ShellMetadata {
  /**
   * Translation key for the primary shell title.
   * Governed routes require a non-empty key (enforced by `validateShellMetadata`).
   */
  readonly titleKey?: string

  /**
   * Ordered breadcrumb trail for the current shell context.
   */
  readonly breadcrumbs?: readonly ShellBreadcrumbDescriptor[]

  /**
   * Declarative header actions for the shell chrome.
   */
  readonly headerActions?: readonly ShellHeaderActionDescriptor[]
}
