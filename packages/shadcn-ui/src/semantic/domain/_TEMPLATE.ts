/**
 * ANTI-DRIFT TEMPLATE — semantic/domain
 *
 * Copy this template for every new domain adapter.
 * Domain adapters convert business truth into governed semantic UI models.
 */
import type { LucideIcon } from "lucide-react"
import { CircleDashed } from "lucide-react"

import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticTone } from "../primitives/tone"

export const templateUiStateValues = ["todo", "in_progress", "done"] as const
export type TemplateUiState = (typeof templateUiStateValues)[number]

export interface TemplateUiModel {
  readonly tone: SemanticTone
  readonly emphasis: SemanticEmphasis
  readonly label: string
  readonly icon: LucideIcon
}

const templateUiModelMap: Record<TemplateUiState, TemplateUiModel> = {
  todo: {
    tone: "neutral",
    emphasis: "subtle",
    label: "Todo",
    icon: CircleDashed,
  },
  in_progress: {
    tone: "info",
    emphasis: "soft",
    label: "In progress",
    icon: CircleDashed,
  },
  done: {
    tone: "success",
    emphasis: "soft",
    label: "Done",
    icon: CircleDashed,
  },
} as const satisfies Record<TemplateUiState, TemplateUiModel>

export function getTemplateUiModel(state: TemplateUiState): TemplateUiModel {
  return templateUiModelMap[state]
}

/**
 * Domain adapter checklist:
 * 1) Declare `*UiStateValues` tuple and derived `*UiState` union.
 * 2) Define a readonly `*UiModel` with tone + label + icon (+ role/emphasis when needed).
 * 3) Provide exhaustive `Record<*UiState, *UiModel>` with `satisfies`.
 * 4) Export deterministic `get*UiModel()` that returns map[state].
 * 5) Never output raw Tailwind class strings from adapters.
 */
