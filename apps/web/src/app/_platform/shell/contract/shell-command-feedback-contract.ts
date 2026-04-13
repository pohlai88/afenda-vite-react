/**
 * SHELL COMMAND FEEDBACK CONTRACT
 *
 * Canonical contracts for deciding how shell command outcomes should be
 * presented to the user across different interaction surfaces.
 */

import type {
  ShellCommandOutcome,
  ShellCommandOutcomeSeverity,
} from "./shell-command-outcome-contract"

export type ShellCommandFeedbackSurface =
  | "toast"
  | "banner"
  | "inline"
  | "silent"

export type ShellCommandFeedbackIntent =
  | "header-action"
  | "page-action"
  | "modal-submit"
  | "background-refresh"

export interface ShellCommandFeedbackContext {
  intent: ShellCommandFeedbackIntent
}

export interface ShellCommandFeedbackPlan {
  surface: ShellCommandFeedbackSurface
  outcome: ShellCommandOutcome
}

/** Input for banner-style feedback (app port; may map to toast until a dedicated banner exists). */
export interface ShellCommandBannerShowInput {
  severity: ShellCommandOutcomeSeverity
  message: string
}

export interface ShellCommandBannerPort {
  show(input: ShellCommandBannerShowInput): void
}

/** Input for inline / form-adjacent feedback (app port). */
export interface ShellCommandInlineShowInput {
  severity: ShellCommandOutcomeSeverity
  message: string
}

export interface ShellCommandInlineFeedbackPort {
  show(input: ShellCommandInlineShowInput): void
}
