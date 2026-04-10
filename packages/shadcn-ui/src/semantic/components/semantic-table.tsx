import { forwardRef, type ReactNode } from "react"

import { Table } from "../../components/ui/table"
import type { TableDensity } from "../../lib/constant/component/table"
import { cn } from "../../lib/utils"
import { SemanticPanel } from "./semantic-panel"
import type { SemanticDensity } from "../primitives/density"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticSurface } from "../primitives/surface"

const tableDensityMap: Record<SemanticDensity, TableDensity> = {
  compact: "compact",
  default: "default",
  comfortable: "comfortable",
}

export interface SemanticTableProps {
  title?: ReactNode
  description?: ReactNode
  toolbar?: ReactNode
  surface?: SemanticSurface
  emphasis?: SemanticEmphasis
  density?: SemanticDensity
  isLoading?: boolean
  isEmpty?: boolean
  loadingState?: ReactNode
  emptyState?: ReactNode
  children: ReactNode
  className?: string
  tableClassName?: string
}

export const SemanticTable = forwardRef<HTMLDivElement, SemanticTableProps>(
  (
    {
      title,
      description,
      toolbar,
      surface = "panel",
      emphasis = "soft",
      density = "default",
      isLoading = false,
      isEmpty = false,
      loadingState = "Loading table data...",
      emptyState = "No data available.",
      children,
      className,
      tableClassName,
    },
    ref
  ) => {
    return (
      <div ref={ref} data-slot="semantic-table" className={className}>
        <SemanticPanel
          surface={surface}
          emphasis={emphasis}
          density={density}
          header={
            title ? (
              <div className="space-y-1">
                <h3 className="text-base font-semibold">{title}</h3>
                {description ? (
                  <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
            ) : undefined
          }
          toolbar={toolbar}
        >
          {isLoading ? (
            <div role="status" className="text-sm text-muted-foreground">
              {loadingState}
            </div>
          ) : isEmpty ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              {emptyState}
            </div>
          ) : (
            <Table density={tableDensityMap[density]} className={cn(tableClassName)}>
              {children}
            </Table>
          )}
        </SemanticPanel>
      </div>
    )
  }
)

SemanticTable.displayName = "SemanticTable"
