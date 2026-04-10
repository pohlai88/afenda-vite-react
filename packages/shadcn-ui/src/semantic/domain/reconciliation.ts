/**
 * SEMANTIC ADAPTER — reconciliation
 * Canonical adapter from reconciliation truth into semantic UI presentation.
 * Semantics: reconciliation states map to reviewed semantic tone, label, and icon outputs.
 * Consumption: use `getReconciliationUiModel()` instead of rebuilding reconciliation presentation inline.
 * Boundaries: this file translates business truth for semantic UI; it is not a general feature sandbox.
 * Changes: update this adapter when reconciliation truth or semantic UI doctrine changes.
 * Purpose: keep reconciliation presentation deterministic and business-meaningful.
 */
import type { LucideIcon } from "lucide-react"
import {
  CircleAlert,
  CircleCheck,
  CircleSlash,
  GitCompareArrows,
  TimerReset,
} from "lucide-react"

import type { SemanticTone } from "../primitives/tone"

export const reconciliationUiStateValues = [
  "matched",
  "partially_matched",
  "unmatched",
  "conflict",
  "stale",
] as const

export type ReconciliationUiState = (typeof reconciliationUiStateValues)[number]

export interface ReconciliationUiModel {
  readonly tone: SemanticTone
  readonly badgeLabel: string
  readonly icon: LucideIcon
}

const reconciliationUiModelMap: Record<
  ReconciliationUiState,
  ReconciliationUiModel
> = {
  matched: {
    tone: "success",
    badgeLabel: "Matched",
    icon: CircleCheck,
  },
  partially_matched: {
    tone: "warning",
    badgeLabel: "Partially matched",
    icon: GitCompareArrows,
  },
  unmatched: {
    tone: "neutral",
    badgeLabel: "Unmatched",
    icon: CircleSlash,
  },
  conflict: {
    tone: "destructive",
    badgeLabel: "Conflict",
    icon: CircleAlert,
  },
  stale: {
    tone: "warning",
    badgeLabel: "Stale",
    icon: TimerReset,
  },
} as const satisfies Record<ReconciliationUiState, ReconciliationUiModel>

export function getReconciliationUiModel(
  state: ReconciliationUiState
): ReconciliationUiModel {
  return reconciliationUiModelMap[state]
}
