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

/** Shared typography; no `flex-1` so labels don’t stretch across the full column width. */
const SCOPE_SEGMENT_VALUE_CLASS =
  "min-w-0 max-w-full shrink truncate text-start font-medium leading-tight tabular-nums text-foreground text-[13px]"

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
      <span className="inline-flex max-w-full min-w-0 items-center gap-1 px-0">
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
            className="h-5 shrink-0 rounded-full px-1.5 text-[10px] font-semibold tracking-wide uppercase"
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
          className="inline-flex h-7 max-w-full min-w-0 items-center gap-1 rounded-md px-1.5 py-0 font-normal hover:bg-accent/40"
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
              className="h-5 shrink-0 rounded-full px-1.5 text-[10px] font-semibold tracking-wide uppercase"
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
      <DropdownMenuContent align="center" className="w-56" sideOffset={4}>
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
 * Up to four positional scope filters (`level_1`…`level_4`), equal grid on `md+`,
 * horizontal scroll on small viewports. Route breadcrumbs are hidden when this renders
 * (see `ShellTopNav`).
 */
export function ShellScopeLineageBar({
  model,
  className,
}: ShellScopeLineageBarProps) {
  const segments = model.segments.slice(0, SHELL_SCOPE_LINEAGE_MAX_SEGMENTS)

  if (segments.length === 0) {
    return null
  }

  return (
    <div
      data-slot="shell.scope-lineage"
      data-placeholder={model.isPlaceholder ? "true" : undefined}
      className={cn(
        "flex max-w-full min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "divide-x divide-border/45",
        className
      )}
    >
      {segments.map((segment) => (
        <div
          key={segment.id}
          className="flex min-h-8 min-w-0 shrink-0 items-center px-1.5 sm:px-2"
        >
          <ScopeSegmentControl segment={segment} />
        </div>
      ))}
    </div>
  )
}
