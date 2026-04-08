/**
 * SEMANTIC ADAPTER — invariant
 * Canonical adapter from invariant truth into semantic UI presentation.
 * Semantics: invariant severities map to reviewed semantic tone, emphasis, label, icon, and alert role outputs.
 * Consumption: use `getInvariantUiModel()` instead of rebuilding invariant presentation inline.
 * Boundaries: this file translates business truth for semantic UI; it is not a general feature sandbox.
 * Changes: update this adapter when invariant truth or semantic UI doctrine changes.
 * Purpose: keep invariant presentation deterministic and business-meaningful.
 */
import type { LucideIcon } from "lucide-react"
import { ShieldAlert, ShieldCheck, ShieldX, TriangleAlert } from "lucide-react"

import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticTone } from "../primitives/tone"

export const invariantSeverityValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export type InvariantSeverity = (typeof invariantSeverityValues)[number]

export interface InvariantUiModel {
  tone: SemanticTone
  icon: LucideIcon
  badgeLabel: string
  alertRole: "status" | "alert"
  emphasis: SemanticEmphasis
}

const invariantUiModelMap: Record<InvariantSeverity, InvariantUiModel> = {
  low: {
    tone: "info",
    icon: ShieldCheck,
    badgeLabel: "Low severity",
    alertRole: "status",
    emphasis: "subtle",
  },
  medium: {
    tone: "warning",
    icon: ShieldAlert,
    badgeLabel: "Medium severity",
    alertRole: "status",
    emphasis: "soft",
  },
  high: {
    tone: "destructive",
    icon: TriangleAlert,
    badgeLabel: "High severity",
    alertRole: "alert",
    emphasis: "solid",
  },
  critical: {
    tone: "destructive",
    icon: ShieldX,
    badgeLabel: "Critical severity",
    alertRole: "alert",
    emphasis: "solid",
  },
}

export function getInvariantUiModel(
  severity: InvariantSeverity
): InvariantUiModel {
  return invariantUiModelMap[severity]
}
