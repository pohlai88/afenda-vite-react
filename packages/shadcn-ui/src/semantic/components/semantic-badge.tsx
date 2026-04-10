/**
 * SEMANTIC COMPONENT — semantic-badge
 * Business-facing semantic badge surface and domain-specific badge wrappers.
 * Semantics: callers provide governed semantic props or domain truth, not raw style decisions.
 * Consumption: prefer this component over rebuilding badge treatment in feature code.
 * Boundaries: domain wrappers should translate truth through semantic adapters, not local maps.
 * Defaults: keep defaults intentional and aligned with semantic doctrine.
 * Changes: preserve semantic contract and accessibility behavior when evolving this component.
 * Purpose: keep badge rendering deterministic and semantically meaningful.
 *
 * Accessibility note: do not add role="status" as a default. role="status" has live-region
 * semantics and is inappropriate for most badge uses (category labels, state chips, visual
 * indicators). Use role="status" only in domain-specific wrappers where the badge announces
 * dynamic status information that should interrupt assistive technology.
 */
import { forwardRef, type ReactNode } from "react"

import { renderSemanticIcon, getBadgeClasses } from "../internal/presentation"
import { cn } from "../../lib/utils"
import {
  getAllocationUiModel,
  type AllocationUiState,
} from "../domain/allocation"
import {
  getEvidenceUiModel,
  type EvidenceUiState,
} from "../domain/evidence"
import {
  getInvariantUiModel,
  type InvariantSeverity,
} from "../domain/invariant"
import {
  getSettlementUiModel,
  type SettlementUiState,
} from "../domain/settlement"
import {
  getIntegritySeverityUiModel,
  type ShellIntegritySeverity,
} from "../domain/integrity-severity"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticTone } from "../primitives/tone"

export interface SemanticBadgeProps {
  tone?: SemanticTone
  emphasis?: SemanticEmphasis
  size?: "sm" | "md"
  icon?: ReactNode
  children: ReactNode
  /** Layout composition className. Must not override governed tone, emphasis, or surface. */
  className?: string
}

export interface InvariantBadgeProps {
  severity: InvariantSeverity
  children?: ReactNode
}

export interface AllocationBadgeProps {
  state: AllocationUiState
  children?: ReactNode
}

export interface EvidenceBadgeProps {
  state: EvidenceUiState
  children?: ReactNode
}

export interface SettlementBadgeProps {
  state: SettlementUiState
  children?: ReactNode
}

export interface IntegritySeverityBadgeProps {
  severity: ShellIntegritySeverity
  children?: ReactNode
}

export const SemanticBadge = forwardRef<HTMLSpanElement, SemanticBadgeProps>(
  (
    {
      tone = "neutral",
      emphasis = "soft",
      size = "md",
      icon,
      children,
      className,
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        data-slot="semantic-badge"
        className={cn(getBadgeClasses(tone, emphasis, size), className)}
      >
        {icon ? <span className="inline-flex items-center">{icon}</span> : null}
        <span>{children}</span>
      </span>
    )
  }
)

SemanticBadge.displayName = "SemanticBadge"

export function InvariantBadge({ severity, children }: InvariantBadgeProps) {
  const model = getInvariantUiModel(severity)

  return (
    <SemanticBadge
      tone={model.tone}
      emphasis={model.emphasis}
      icon={renderSemanticIcon(model.icon, "size-3.5")}
    >
      {children ?? model.badgeLabel}
    </SemanticBadge>
  )
}

export function AllocationBadge({ state, children }: AllocationBadgeProps) {
  const model = getAllocationUiModel(state)

  return (
    <SemanticBadge
      tone={model.tone}
      emphasis="soft"
      icon={renderSemanticIcon(model.icon, "size-3.5")}
    >
      {children ?? model.badgeLabel}
    </SemanticBadge>
  )
}

export function EvidenceBadge({ state, children }: EvidenceBadgeProps) {
  const model = getEvidenceUiModel(state)

  return (
    <SemanticBadge
      tone={model.tone}
      emphasis={model.tone === "destructive" ? "solid" : "soft"}
      icon={renderSemanticIcon(model.icon, "size-3.5")}
    >
      {children ?? model.badgeLabel}
    </SemanticBadge>
  )
}

export function SettlementBadge({ state, children }: SettlementBadgeProps) {
  const model = getSettlementUiModel(state)

  return (
    <SemanticBadge
      tone={model.tone}
      emphasis="soft"
      icon={renderSemanticIcon(model.icon, "size-3.5")}
    >
      {children ?? model.badgeLabel}
    </SemanticBadge>
  )
}

export function IntegritySeverityBadge({
  severity,
  children,
}: IntegritySeverityBadgeProps) {
  const model = getIntegritySeverityUiModel(severity)

  return (
    <SemanticBadge
      tone={model.tone}
      emphasis={model.tone === "destructive" ? "solid" : "soft"}
      icon={renderSemanticIcon(model.icon, "size-3.5")}
    >
      {children ?? model.label}
    </SemanticBadge>
  )
}
