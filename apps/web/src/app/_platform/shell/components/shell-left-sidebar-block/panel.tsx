"use client"

import type { ComponentProps } from "react"

import { SidebarContent } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type { ShellNavigationItemId } from "../../constants/shell-navigation-item-ids"
import type { ShellNavigationItem } from "../../contract/shell-navigation-contract"
import { ShellLabelsColumnNav } from "./nav"
import { ShellLabelsColumnSearch } from "./search"

const SHELL_LABELS_COLUMN_CLASS =
  "bg-sidebar text-sidebar-foreground flex min-h-0 min-w-0 flex-1 flex-col"

export type ShellLabelsColumnProps = {
  grouped: ReadonlyMap<string, ShellNavigationItem[]>
  enabledSet: ReadonlySet<ShellNavigationItemId>
} & ComponentProps<"div">

/**
 * Wide “labels” column next to the icon rail: search + grouped navigation.
 * Does not own grouping policy — callers pass `grouped` + `enabledSet`.
 */
export function ShellLabelsColumn({
  grouped,
  enabledSet,
  className,
  ...divProps
}: ShellLabelsColumnProps) {
  return (
    <div
      {...divProps}
      data-slot="shell.labels-column"
      className={cn(SHELL_LABELS_COLUMN_CLASS, className)}
    >
      <ShellLabelsColumnSearch />
      <SidebarContent className="min-h-0 flex-1">
        <ShellLabelsColumnNav grouped={grouped} enabledSet={enabledSet} />
      </SidebarContent>
    </div>
  )
}
