/**
 * SEMANTIC COMPONENT — semantic-alert
 * Business-facing semantic alert surface and domain-specific alert wrappers.
 * Semantics: callers provide governed semantic props or domain truth, not raw style decisions.
 * Consumption: prefer this component over rebuilding alert treatment in feature code.
 * Boundaries: domain wrappers should translate truth through semantic adapters, not local maps.
 * Defaults: keep defaults intentional and aligned with semantic doctrine.
 * Changes: preserve semantic contract and accessibility behavior when evolving this component.
 * Purpose: keep alert rendering deterministic, accessible, and semantically meaningful.
 */
import { forwardRef, type ReactNode } from "react"

import {
  getEvidenceUiModel,
  type EvidenceUiState,
} from "../domain/evidence"
import {
  getInvariantUiModel,
  type InvariantSeverity,
} from "../domain/invariant"
import {
  getReconciliationUiModel,
  type ReconciliationUiState,
} from "../domain/reconciliation"
import { getAlertClasses, renderSemanticIcon } from "../internal/presentation"
import { cn } from "../../lib/utils"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticTone } from "../primitives/tone"

export interface SemanticAlertProps {
  tone: SemanticTone
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  emphasis?: SemanticEmphasis
  actions?: ReactNode
  role?: "status" | "alert"
  /** Layout composition className. Must not override governed tone, emphasis, or surface. */
  className?: string
}

export interface InvariantAlertProps {
  severity: InvariantSeverity
  title?: ReactNode
  description?: ReactNode
  resolution?: ReactNode
}

export interface EvidenceAlertProps {
  state: EvidenceUiState
  title?: ReactNode
  description?: ReactNode
}

export interface ReconciliationAlertProps {
  state: ReconciliationUiState
  title?: ReactNode
  description?: ReactNode
}

export const SemanticAlert = forwardRef<HTMLDivElement, SemanticAlertProps>(
  (
    {
      tone,
      title,
      description,
      icon,
      emphasis = "soft",
      actions,
      role = "status",
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="semantic-alert"
        className={cn(getAlertClasses(tone, emphasis), className)}
        role={role}
      >
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="mt-0.5 inline-flex shrink-0 items-center">{icon}</div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            {title ? <div className="font-medium">{title}</div> : null}
            {description ? (
              <div className="text-sm opacity-90">{description}</div>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    )
  }
)

SemanticAlert.displayName = "SemanticAlert"

export function InvariantAlert({
  severity,
  title,
  description,
  resolution,
}: InvariantAlertProps) {
  const model = getInvariantUiModel(severity)

  return (
    <SemanticAlert
      tone={model.tone}
      emphasis={model.emphasis}
      title={title ?? model.badgeLabel}
      description={description}
      icon={renderSemanticIcon(model.icon, "size-4")}
      actions={resolution}
      role={model.alertRole}
    />
  )
}

export function ReconciliationAlert({
  state,
  title,
  description,
}: ReconciliationAlertProps) {
  const model = getReconciliationUiModel(state)

  return (
    <SemanticAlert
      tone={model.tone}
      title={title ?? model.badgeLabel}
      description={description}
      icon={renderSemanticIcon(model.icon, "size-4")}
      emphasis={model.tone === "destructive" ? "solid" : "soft"}
      role={model.tone === "destructive" ? "alert" : "status"}
    />
  )
}

export function EvidenceAlert({ state, title, description }: EvidenceAlertProps) {
  const model = getEvidenceUiModel(state)
  const isBlocking = state === "missing" || state === "tampered"

  return (
    <SemanticAlert
      tone={model.tone}
      title={title ?? model.badgeLabel}
      description={description}
      icon={renderSemanticIcon(model.icon, "size-4")}
      emphasis={isBlocking ? "solid" : "soft"}
      role={isBlocking ? "alert" : "status"}
    />
  )
}
