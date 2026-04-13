/**
 * SHELL HEADER ACTION CONTRACT
 *
 * Canonical descriptor contracts for shell header actions.
 * These contracts keep route-owned shell actions declarative and prevent
 * component-local invention of header buttons.
 *
 * Rules:
 * - descriptors are metadata, not executable closures
 * - action identity must be stable
 * - labels are translation keys, not resolved text
 * - execution is expressed declaratively through command ids or navigation targets
 * - resolved items are render-ready and safe for presentational consumers
 */

export type ShellHeaderActionKind = "command" | "link"

export type ShellHeaderActionTone = "default" | "primary" | "secondary"

export type ShellHeaderActionVisibility = "always" | "desktop-only"

export interface ShellHeaderActionDescriptor {
  /**
   * Stable action identity owned by the metadata producer.
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
   * Optional button tone for the shell chrome.
   */
  tone?: ShellHeaderActionTone

  /**
   * Optional visibility contract for responsive rendering.
   */
  visibility?: ShellHeaderActionVisibility

  /**
   * Declarative command id for runtime action execution.
   * Required when kind = "command".
   */
  commandId?: string

  /**
   * Declarative navigation target.
   * Required when kind = "link".
   */
  to?: string

  /**
   * Optional disabled state.
   */
  disabled?: boolean
}

export interface ShellHeaderActionResolvedItem {
  id: string
  labelKey: string
  label: string
  kind: ShellHeaderActionKind
  tone: ShellHeaderActionTone
  visibility: ShellHeaderActionVisibility
  commandId?: string
  to?: string
  disabled: boolean
}

export interface ResolveShellHeaderActionsOptions {
  actions: readonly ShellHeaderActionDescriptor[]
  translate: (labelKey: string) => string
}
