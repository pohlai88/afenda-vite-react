"use client"

import { ChevronsUpDown } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type { TFunction } from "i18next"
import type {
  ShellScopeLineageModel,
  ShellScopeLineageSegment,
} from "../../contract/shell-scope-lineage.contract"

/** Max scope filters in the chrome (product rule). */
export const SHELL_SCOPE_LINEAGE_MAX_SEGMENTS = 4 as const

/** Value text: truncates within the equal-width column; tabular-nums keeps numeric labels aligned. */
const SCOPE_SEGMENT_VALUE_CLASS =
  "min-w-0 flex-1 truncate text-start font-medium leading-tight tabular-nums text-foreground text-[13px]"

function scopeLineageGridColsClass(
  segmentCount: number
): "grid-cols-1" | "grid-cols-2" | "grid-cols-3" | "grid-cols-4" {
  if (segmentCount <= 1) {
    return "grid-cols-1"
  }
  if (segmentCount === 2) {
    return "grid-cols-2"
  }
  if (segmentCount === 3) {
    return "grid-cols-3"
  }
  return "grid-cols-4"
}

export type ShellScopeLineageBarProps = {
  model: ShellScopeLineageModel
  className?: string
}

function scopeDimensionTitle(
  segment: ShellScopeLineageSegment,
  t: TFunction<"shell">
): string {
  if (segment.dimensionLabel) {
    return segment.dimensionLabel
  }
  switch (segment.slot) {
    case "level_1":
      return t("scope_lineage.slot.level_1")
    case "level_2":
      return t("scope_lineage.slot.level_2")
    case "level_3":
      return t("scope_lineage.slot.level_3")
    case "level_4":
      return t("scope_lineage.slot.level_4")
  }
}

function ScopeSegmentControl({
  segment,
}: {
  segment: ShellScopeLineageSegment
}) {
  const { t } = useTranslation("shell")
  const badge = segment.badge
  const dimensionTitle = scopeDimensionTitle(segment, t)

  if (!segment.switchable) {
    return (
      <span className="inline-flex w-full min-w-0 items-center gap-[0.125rem]">
        <span className={SCOPE_SEGMENT_VALUE_CLASS}>{segment.label}</span>
        {badge ? (
          <Badge
            variant={
              badge.variant === "secondary"
                ? "secondary"
                : badge.variant === "default"
                  ? "default"
                  : "outline"
            }
            className="h-[1.25rem] shrink-0 rounded-full px-0.5 text-[10px] font-semibold tracking-wide uppercase"
          >
            {badge.label}
          </Badge>
        ) : null}
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="inline-flex h-[1.75rem] w-full min-w-0 items-center gap-[0.125rem] rounded-md px-0.5 py-0 font-normal hover:bg-accent/40"
          aria-label={t("scope_lineage.switch_dimension", {
            dimension: dimensionTitle,
            value: segment.label,
          })}
        >
          <span className={SCOPE_SEGMENT_VALUE_CLASS}>{segment.label}</span>
          {badge ? (
            <Badge
              variant={
                badge.variant === "secondary"
                  ? "secondary"
                  : badge.variant === "default"
                    ? "default"
                    : "outline"
              }
              className="h-[1.25rem] shrink-0 rounded-full px-0.5 text-[10px] font-semibold tracking-wide uppercase"
            >
              {badge.label}
            </Badge>
          ) : null}
          <ChevronsUpDown
            className="size-3 shrink-0 opacity-60"
            strokeWidth={1.5}
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[14rem]" sideOffset={4}>
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {dimensionTitle}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          {t("scope_lineage.switcher_placeholder")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Up to four positional scope filters (`level_1`…`level_4`).
 * **Compact equal columns:** each slot gets the same width (`minmax(0, 1fr)`), matching a
 * short entity label (e.g. “Acme Holdings”); longer text truncates. Tight horizontal
 * padding on outer edges. Route breadcrumbs are hidden when this renders (`ShellTopNav`).
 */
export function ShellScopeLineageBar({
  model,
  className,
}: ShellScopeLineageBarProps) {
  const segments = model.segments.slice(0, SHELL_SCOPE_LINEAGE_MAX_SEGMENTS)
  const segmentCount = segments.length

  if (segmentCount === 0) {
    return null
  }

  return (
    <div
      data-slot="shell.scope-lineage"
      data-placeholder={model.isPlaceholder ? "true" : undefined}
      className={cn(
        "grid max-w-full min-w-0 flex-1 items-stretch gap-[0]",
        scopeLineageGridColsClass(segmentCount),
        "divide-x divide-border/45",
        className
      )}
    >
      {segments.map((segment) => (
        <div
          key={segment.id}
          className="flex min-h-7 min-w-0 items-center px-0.5 first:pl-px last:pr-px sm:first:pl-0.5 sm:last:pr-0.5"
        >
          <ScopeSegmentControl segment={segment} />
        </div>
      ))}
    </div>
  )
}
