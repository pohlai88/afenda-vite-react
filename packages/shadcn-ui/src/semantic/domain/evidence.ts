/**
 * SEMANTIC ADAPTER — evidence
 * Canonical adapter from evidence truth into semantic UI presentation.
 * Semantics: evidence states map to reviewed semantic tone, label, and icon outputs.
 * Consumption: use `getEvidenceUiModel()` instead of rebuilding evidence presentation inline.
 * Boundaries: this file translates business truth for semantic UI; it is not a general feature sandbox.
 * Changes: update this adapter when evidence truth or semantic UI doctrine changes.
 * Purpose: keep evidence presentation deterministic and business-meaningful.
 */
import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  BadgeHelp,
  BadgeMinus,
  BadgeX,
  ShieldAlert,
} from "lucide-react"

import type { SemanticTone } from "../primitives/tone"

export const evidenceUiStateValues = [
  "present",
  "missing",
  "stale",
  "tampered",
  "unverified",
] as const

export type EvidenceUiState = (typeof evidenceUiStateValues)[number]

export interface EvidenceUiModel {
  readonly tone: SemanticTone
  readonly badgeLabel: string
  readonly icon: LucideIcon
}

const evidenceUiModelMap: Record<EvidenceUiState, EvidenceUiModel> = {
  present: {
    tone: "success",
    badgeLabel: "Present",
    icon: BadgeCheck,
  },
  missing: {
    tone: "destructive",
    badgeLabel: "Missing",
    icon: BadgeX,
  },
  stale: {
    tone: "warning",
    badgeLabel: "Stale",
    icon: BadgeMinus,
  },
  tampered: {
    tone: "destructive",
    badgeLabel: "Tampered",
    icon: ShieldAlert,
  },
  unverified: {
    tone: "info",
    badgeLabel: "Unverified",
    icon: BadgeHelp,
  },
} as const satisfies Record<EvidenceUiState, EvidenceUiModel>

export function getEvidenceUiModel(state: EvidenceUiState): EvidenceUiModel {
  return evidenceUiModelMap[state]
}
