"use client"

import { Sidebar, TooltipProvider } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { AppShellSidebarRailColumn } from "../shell-rail-sidebar-block/shell-rail-column"
import { ShellLabelsColumn } from "./panel"
import type { ShellLeftSidebarDisplayMode } from "./shell-left-sidebar-display-mode"
import type { ShellLeftSidebarNavigationModel } from "./use-shell-left-sidebar-navigation-model"

const SHELL_LEFT_SIDEBAR_CLASS =
  "overflow-hidden **:data-[slot=sidebar-inner]:flex **:data-[slot=sidebar-inner]:min-h-0 **:data-[slot=sidebar-inner]:flex-row"

export type ShellLeftSidebarProps = {
  /** Shared navigation model (one hook in the shell layout for rail + labels). */
  model: ShellLeftSidebarNavigationModel
  displayMode?: ShellLeftSidebarDisplayMode
  onDisplayModeChange?: (nextMode: ShellLeftSidebarDisplayMode) => void
  onDisplayModeHoverIntentChange?: (active: boolean) => void
  isDisplayExpanded?: boolean
}

/**
 * Desktop: static-width rail (`collapsible="none"`; labels render in `SidebarInset` below the top nav).
 * Mobile sheet: rail + labels side‑by‑side (`md:hidden` on the inset copy).
 */
export function ShellLeftSidebar({
  model,
  displayMode = "expanded",
  onDisplayModeChange = () => {},
  onDisplayModeHoverIntentChange = () => {},
  isDisplayExpanded = true,
}: ShellLeftSidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Sidebar
        collapsible="none"
        variant="sidebar"
        className={cn(SHELL_LEFT_SIDEBAR_CLASS)}
      >
        <AppShellSidebarRailColumn
          railWidgets={model.railWidgets}
          displayMode={displayMode}
          onDisplayModeChange={onDisplayModeChange}
          onDisplayModeHoverIntentChange={onDisplayModeHoverIntentChange}
          isDisplayExpanded={isDisplayExpanded}
        />
        <ShellLabelsColumn
          grouped={model.grouped}
          enabledSet={model.enabledSet}
          className="min-w-0 flex-1 md:hidden"
        />
      </Sidebar>
    </TooltipProvider>
  )
}

/** Compatibility alias — same as {@link ShellLeftSidebar}. */
export const AppShellSidebar = ShellLeftSidebar
