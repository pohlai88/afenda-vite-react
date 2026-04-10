/**
 * ANTI-DRIFT TEMPLATE — semantic/components
 *
 * Copy this template when creating a new semantic component in this folder.
 * Keep it thin, deterministic, and aligned to semantic primitives + adapters.
 */
import { forwardRef, type ReactNode } from "react"

import { cn } from "../../lib/utils"
import type { SemanticDensity } from "../primitives/density"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticTone } from "../primitives/tone"

// Optional imports for domain wrapper pattern:
// import { getDomainUiModel, type DomainUiState } from "../domain/domain-name"
// import { getXClasses, renderSemanticIcon } from "../internal/presentation"

export interface SemanticTemplateProps {
  tone?: SemanticTone
  emphasis?: SemanticEmphasis
  density?: SemanticDensity
  children?: ReactNode
  /** Layout composition className. Must not override governed semantic contracts. */
  className?: string
}

export const SemanticTemplate = forwardRef<HTMLDivElement, SemanticTemplateProps>(
  (
    {
      tone = "neutral",
      emphasis = "soft",
      density = "default",
      children,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="semantic-template"
        data-tone={tone}
        data-emphasis={emphasis}
        data-density={density}
        className={cn(className)}
      >
        {children}
      </div>
    )
  }
)

SemanticTemplate.displayName = "SemanticTemplate"

/**
 * Domain wrapper checklist:
 * 1) Input is domain truth (`state`, `severity`) from a typed adapter.
 * 2) Resolve with `get*UiModel()` from `../domain/*`.
 * 3) Render semantic surface (`SemanticBadge`, `SemanticAlert`, etc.).
 * 4) Pass governed tone/emphasis/icon from model, never raw class maps.
 */
// export interface DomainTemplateProps {
//   state: DomainUiState
//   children?: ReactNode
// }
//
// export function DomainTemplate({ state, children }: DomainTemplateProps) {
//   const model = getDomainUiModel(state)
//
//   return (
//     <SemanticTemplate
//       tone={model.tone}
//       emphasis={model.emphasis ?? "soft"}
//     >
//       {children ?? model.label}
//     </SemanticTemplate>
//   )
// }
