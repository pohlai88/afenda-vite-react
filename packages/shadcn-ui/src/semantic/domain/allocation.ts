/**
 * SEMANTIC ADAPTER — allocation
 * Canonical adapter from allocation truth into semantic UI presentation.
 * Semantics: allocation states map to reviewed semantic tone, label, and icon outputs.
 * Consumption: use `getAllocationUiModel()` instead of rebuilding allocation presentation inline.
 * Boundaries: this file translates business truth for semantic UI; it is not a general feature sandbox.
 * Changes: update this adapter when allocation truth or semantic UI doctrine changes.
 * Purpose: keep allocation presentation deterministic and business-meaningful.
 */
import type { LucideIcon } from "lucide-react"
import {
  Ban,
  CircleDashed,
  CircleDot,
  CircleSlash,
  CircleCheck,
  TriangleAlert,
  Undo2,
} from "lucide-react"

import type { SemanticTone } from "../primitives/tone"

export const allocationUiStateValues = [
  "draft",
  "pending",
  "partial",
  "allocated",
  "reversed",
  "blocked",
  "failed",
] as const

export type AllocationUiState = (typeof allocationUiStateValues)[number]

export interface AllocationUiModel {
  readonly tone: SemanticTone
  readonly badgeLabel: string
  readonly icon: LucideIcon
}

const allocationUiModelMap: Record<AllocationUiState, AllocationUiModel> = {
  draft: {
    tone: "neutral",
    badgeLabel: "Draft",
    icon: CircleDashed,
  },
  pending: {
    tone: "warning",
    badgeLabel: "Pending",
    icon: CircleDot,
  },
  partial: {
    tone: "warning",
    badgeLabel: "Partial",
    icon: TriangleAlert,
  },
  allocated: {
    tone: "success",
    badgeLabel: "Allocated",
    icon: CircleCheck,
  },
  reversed: {
    tone: "neutral",
    badgeLabel: "Reversed",
    icon: Undo2,
  },
  blocked: {
    tone: "destructive",
    badgeLabel: "Blocked",
    icon: Ban,
  },
  failed: {
    tone: "destructive",
    badgeLabel: "Failed",
    icon: CircleSlash,
  },
} as const satisfies Record<AllocationUiState, AllocationUiModel>

export function getAllocationUiModel(
  state: AllocationUiState
): AllocationUiModel {
  return allocationUiModelMap[state]
}
