/**
 * SEMANTIC ADAPTER — settlement
 * Canonical adapter from settlement truth into semantic UI presentation.
 * Semantics: settlement states map to reviewed semantic tone, label, and icon outputs.
 * Consumption: use `getSettlementUiModel()` instead of rebuilding settlement presentation inline.
 * Boundaries: this file translates business truth for semantic UI; it is not a general feature sandbox.
 * Changes: update this adapter when settlement truth or semantic UI doctrine changes.
 * Purpose: keep settlement presentation deterministic and business-meaningful.
 */
import type { LucideIcon } from "lucide-react"
import {
  CircleCheck,
  CircleDashed,
  CircleSlash,
  Clock3,
  TriangleAlert,
  Undo2,
} from "lucide-react"

import type { SemanticTone } from "../primitives/tone"

export const settlementUiStateValues = [
  "open",
  "partial",
  "settled",
  "overdue",
  "reversed",
  "failed",
] as const

export type SettlementUiState = (typeof settlementUiStateValues)[number]

export interface SettlementUiModel {
  tone: SemanticTone
  badgeLabel: string
  icon: LucideIcon
}

const settlementUiModelMap: Record<SettlementUiState, SettlementUiModel> = {
  open: {
    tone: "neutral",
    badgeLabel: "Open",
    icon: CircleDashed,
  },
  partial: {
    tone: "warning",
    badgeLabel: "Partial",
    icon: TriangleAlert,
  },
  settled: {
    tone: "success",
    badgeLabel: "Settled",
    icon: CircleCheck,
  },
  overdue: {
    tone: "destructive",
    badgeLabel: "Overdue",
    icon: Clock3,
  },
  reversed: {
    tone: "neutral",
    badgeLabel: "Reversed",
    icon: Undo2,
  },
  failed: {
    tone: "destructive",
    badgeLabel: "Failed",
    icon: CircleSlash,
  },
}

export function getSettlementUiModel(
  state: SettlementUiState
): SettlementUiModel {
  return settlementUiModelMap[state]
}
