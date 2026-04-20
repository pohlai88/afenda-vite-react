import type { ReactNode } from "react"

import { cn } from "@afenda/design-system/utils"

export interface FeatureTemplatePanelShellProps {
  readonly title: string
  readonly description: string
  readonly headingId: string
  readonly children: ReactNode
  readonly className?: string
  readonly headerSlot?: ReactNode
}

export interface FeatureTemplatePanelEmptyStateProps {
  readonly children: ReactNode
  readonly className?: string
}

export function FeatureTemplatePanelShell({
  title,
  description,
  headingId,
  children,
  className,
  headerSlot,
}: FeatureTemplatePanelShellProps) {
  return (
    <section
      className={cn("ui-density-panel min-w-0 overflow-hidden", className)}
      aria-labelledby={headingId}
    >
      <div className="border-b border-border-muted px-4 py-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={headingId} className="ui-title-section">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {headerSlot ? <div className="shrink-0">{headerSlot}</div> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

export function FeatureTemplatePanelEmptyState({
  children,
  className,
}: FeatureTemplatePanelEmptyStateProps) {
  return (
    <div className={cn("p-4", className)}>
      <p className="ui-empty-state">{children}</p>
    </div>
  )
}
