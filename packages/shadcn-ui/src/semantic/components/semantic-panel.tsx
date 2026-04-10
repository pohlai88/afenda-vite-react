/**
 * SEMANTIC COMPONENT — semantic-panel
 * Business-facing semantic panel wrapper for governed surface, density, and emphasis composition.
 * Semantics: callers provide governed semantic inputs instead of rebuilding panel chrome inline.
 * Consumption: prefer this wrapper over ad hoc card or section containers in feature code.
 * Boundaries: layout, spacing, and surface behavior should stay centralized here.
 * Defaults: keep defaults intentional and aligned with semantic doctrine.
 * Changes: preserve semantic contract and accessibility behavior when evolving this component.
 * Purpose: keep panel rendering deterministic and semantically meaningful.
 */
import { forwardRef, useId, type ReactNode } from "react"

import {
  getPanelClasses,
  getPanelSectionSpacing,
} from "../internal/presentation"
import { cn } from "../../lib/utils"
import type { SemanticDensity } from "../primitives/density"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticSurface } from "../primitives/surface"

export interface SemanticPanelProps {
  surface?: SemanticSurface
  density?: SemanticDensity
  emphasis?: SemanticEmphasis
  header?: ReactNode
  toolbar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  /** Layout composition className. Must not override governed tone, emphasis, or surface. */
  className?: string
}

export const SemanticPanel = forwardRef<HTMLElement, SemanticPanelProps>(
  (
    {
      surface = "panel",
      density = "comfortable",
      emphasis = "soft",
      header,
      toolbar,
      footer,
      children,
      className,
    },
    ref
  ) => {
    const headingId = useId()
    const sectionSpacing = getPanelSectionSpacing(density)

    return (
      <section
        ref={ref}
        data-slot="semantic-panel"
        aria-labelledby={header ? headingId : undefined}
        className={cn(getPanelClasses(surface, density, emphasis), className)}
      >
        {header || toolbar ? (
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b border-border/60",
              sectionSpacing
            )}
          >
            <div id={header ? headingId : undefined} className="min-w-0 flex-1">
              {header}
            </div>
            {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
          </div>
        ) : null}
        <div className={sectionSpacing}>{children}</div>
        {footer ? (
          <div className={cn("border-t border-border/60", sectionSpacing)}>
            {footer}
          </div>
        ) : null}
      </section>
    )
  }
)

SemanticPanel.displayName = "SemanticPanel"
