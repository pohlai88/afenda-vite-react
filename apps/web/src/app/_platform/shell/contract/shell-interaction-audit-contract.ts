/**
 * SHELL INTERACTION AUDIT CONTRACT
 *
 * UI interaction evidence only — not business-domain audit. Shell captures
 * facts it knows; persistence and doctrine live in the audit subsystem.
 */

export type ShellInteractionKind = "shell.command"

export type ShellInteractionMechanism =
  | "click"
  | "keyboard"
  | "programmatic"
  | "navigation"

/** Lifecycle / terminal state for the interaction row. */
export type ShellInteractionPhase =
  | "started"
  | "succeeded"
  | "failed"
  | "cancelled"

export interface ShellInteractionAuditEnvelope {
  kind: ShellInteractionKind
  mechanism: ShellInteractionMechanism
  interactionPhase: ShellInteractionPhase

  actorUserId?: string
  actingAsUserId?: string

  actionType?: string
  commandId?: string
  shellSurface?: string

  occurredAt?: string

  routeId?: string
  pathname?: string
  shellRegion?: string

  reasonCategory?: string
  metadataReasonKey?: string

  tenantId?: string
  targetModule?: string
  targetFeature?: string
  targetEntityRef?: string

  affectedSubjectRef?: string

  /** From ShellCommandOutcome.category when terminal (aids API outcome mapping). */
  commandOutcomeCategory?: string
  /** Non-PII diagnostic; omit or truncate in production if needed. */
  errorMessage?: string
}
