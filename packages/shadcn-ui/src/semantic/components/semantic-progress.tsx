import { forwardRef, type ReactNode } from "react"

import { getToneBgClass } from "../../lib/constant/semantic/tone"
import { cn } from "../../lib/utils"
import type { SemanticDensity } from "../primitives/density"
import type { SemanticTone } from "../primitives/tone"

const progressHeightByDensity: Record<SemanticDensity, string> = {
  compact: "h-2",
  default: "h-2.5",
  comfortable: "h-3",
}

export interface SemanticProgressProps {
  value: number
  max?: number
  tone?: SemanticTone
  density?: SemanticDensity
  label?: ReactNode
  showValue?: boolean
  className?: string
}

export const SemanticProgress = forwardRef<HTMLDivElement, SemanticProgressProps>(
  (
    {
      value,
      max = 100,
      tone = "info",
      density = "default",
      label,
      showValue = true,
      className,
    },
    ref
  ) => {
    const normalizedMax = Math.max(1, max)
    const clampedValue = Math.min(Math.max(value, 0), normalizedMax)
    const percent = Math.round((clampedValue / normalizedMax) * 100)

    return (
      <div ref={ref} data-slot="semantic-progress" className={cn("space-y-2", className)}>
        {label ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{label}</span>
            {showValue ? (
              <span className="text-muted-foreground">{percent}%</span>
            ) : null}
          </div>
        ) : null}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={normalizedMax}
          aria-valuenow={clampedValue}
          className={cn(
            "w-full overflow-hidden rounded-full bg-muted",
            progressHeightByDensity[density]
          )}
        >
          <div
            className={cn("h-full transition-all", getToneBgClass(tone))}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    )
  }
)

SemanticProgress.displayName = "SemanticProgress"
