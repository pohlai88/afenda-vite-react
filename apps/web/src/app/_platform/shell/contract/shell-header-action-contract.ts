/**
 * SHELL HEADER ACTION CONTRACT
 *
 * Canonical declarative header-action contracts for the platform shell.
 * These descriptors are emitted by route-owned shell metadata and later
 * resolved into render-ready action items for the shell chrome.
 *
 * Rules:
 * - ids must be stable and source-owned
 * - labels are translation keys, not display text
 * - descriptors must remain declarative
 * - no callbacks, JSX, or component instances in metadata
 * - action payload requirements depend on `kind`
 */

export type ShellHeaderActionKind = "link" | "command"

export type ShellHeaderActionEmphasis = "default" | "primary" | "secondary"

export interface ShellHeaderActionDescriptor {
  /**
   * Stable identity for the action.
   */
  id: string

  /**
   * Translation key in the `shell` namespace.
   */
  labelKey: string

  /**
   * Declarative action kind.
   */
  kind: ShellHeaderActionKind

  /**
   * Route target for navigational header actions.
   * Required when `kind === "link"`.
   */
  to?: string

  /**
   * Command identifier for command-driven actions.
   * Required when `kind === "command"`.
   */
  commandId?: string

  /**
   * Optional icon token/name.
   * Interpretation belongs to the rendering layer.
   */
  icon?: string

  /**
   * Optional visual emphasis hint for the chrome layer.
   */
  emphasis?: ShellHeaderActionEmphasis

  /**
   * Optional declarative disabled state.
   */
  isDisabled?: boolean
}

export interface ShellHeaderActionResolvedItem {
  id: string
  labelKey: string
  label: string
  kind: ShellHeaderActionKind
  to?: string
  commandId?: string
  icon?: string
  emphasis: ShellHeaderActionEmphasis
  isDisabled: boolean
}

export interface ResolveShellHeaderActionsOptions {
  actions: readonly ShellHeaderActionDescriptor[]
  translate: (labelKey: string) => string
}
