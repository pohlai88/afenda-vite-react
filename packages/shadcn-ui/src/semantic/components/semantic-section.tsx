/**
 * SEMANTIC COMPONENT — semantic-section
 * Business-facing semantic section wrapper for titled content blocks and toolbar composition.
 * Semantics: callers provide semantic content structure instead of rebuilding section chrome inline.
 * Consumption: prefer this wrapper over ad hoc titled block layouts in feature code.
 * Boundaries: section title, description, and toolbar behavior should stay centralized here.
 * Defaults: keep defaults intentional and aligned with semantic doctrine.
 * Changes: preserve semantic contract and accessibility behavior when evolving this component.
 * Purpose: keep section rendering deterministic and semantically meaningful.
 */
import { useId, type ReactNode, type Ref } from "react"

import { cn } from "../../lib/utils"

export interface SemanticSectionProps {
  title: ReactNode
  description?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  /** Layout composition className. Must not override governed section structure. */
  className?: string
  ref?: Ref<HTMLElement>
}

export function SemanticSection({
  title,
  description,
  toolbar,
  children,
  className,
  ref,
}: SemanticSectionProps) {
  const titleId = useId()

  return (
    <section
      ref={ref}
      data-slot="semantic-section"
      aria-labelledby={titleId}
      className={cn("space-y-4", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div id={titleId} className="text-lg font-semibold">
            {title}
          </div>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
        {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  )
}
