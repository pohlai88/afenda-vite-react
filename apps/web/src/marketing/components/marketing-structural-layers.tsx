import type { LucideIcon } from "lucide-react"

import { cn } from "@afenda/design-system/utils"

const MARKETING_GRID_SIZE_CLASS_NAME: Record<number, string> = {
  36: "marketing-structural-grid-bg--36",
  38: "marketing-structural-grid-bg--38",
  40: "marketing-structural-grid-bg--40",
  42: "marketing-structural-grid-bg--42",
  48: "marketing-structural-grid-bg--48",
}

const MARKETING_VERTICAL_RULES_GAP_CLASS_NAME: Record<number, string> = {
  96: "marketing-structural-vertical-rules-bg--96",
  104: "marketing-structural-vertical-rules-bg--104",
  108: "marketing-structural-vertical-rules-bg--108",
  112: "marketing-structural-vertical-rules-bg--112",
  120: "marketing-structural-vertical-rules-bg--120",
}

export function MarketingStructuralGridBg({
  className,
  sizePx = 40,
}: {
  readonly className?: string
  /** Grid cell size in pixels. */
  readonly sizePx?: number
}) {
  return (
    <div
      className={cn(
        "marketing-structural-grid-bg pointer-events-none absolute inset-0 opacity-[0.055]",
        MARKETING_GRID_SIZE_CLASS_NAME[sizePx],
        className
      )}
      aria-hidden="true"
    />
  )
}

export function MarketingStructuralBaseline({
  className,
}: {
  readonly className?: string
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/80",
        className
      )}
      aria-hidden="true"
    />
  )
}

export function MarketingStructuralVerticalRulesBg({
  className,
  gapPx = 120,
}: {
  readonly className?: string
  readonly gapPx?: number
}) {
  return (
    <div
      className={cn(
        "marketing-structural-vertical-rules-bg pointer-events-none absolute inset-0 opacity-[0.04]",
        MARKETING_VERTICAL_RULES_GAP_CLASS_NAME[gapPx],
        className
      )}
      aria-hidden="true"
    />
  )
}

export type MarketingRuledSurfaceItem = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

export function MarketingRuledSurfaceStack({
  items,
  className,
  introSpacingClassName = "mt-10",
  embedded = false,
}: {
  readonly items: readonly MarketingRuledSurfaceItem[]
  readonly className?: string
  readonly introSpacingClassName?: string
  /** Sidebar / inset: no top rule on the stack; first row aligns flush. */
  readonly embedded?: boolean
}) {
  return (
    <ul
      className={cn(
        "marketing-ruled-surface-stack",
        introSpacingClassName,
        embedded ? undefined : "border-t border-border/70",
        className
      )}
      aria-label="Topic surfaces"
    >
      {items.map(({ title, body, icon: Icon }) => (
        <li
          key={title}
          className="marketing-ruled-surface-stack-item flex gap-5 border-b border-border/60 py-8 md:gap-6 md:py-9"
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center border border-dashed border-border/70"
            aria-hidden="true"
          >
            <Icon className="size-5 text-primary" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-balance text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
              {body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
