"use client"

import type { CSSProperties, FocusEvent } from "react"
import { Outlet } from "react-router-dom"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { ShellOutletErrorBoundary } from "../../../../_components"
import { useShellContextBar } from "../../hooks/use-shell-context-bar"
import { shellSlotActivationV1 } from "../../policy/shell-navigation-policy"
import { ShellContentBlock } from "../shell-content-block"
import { ShellContextBar } from "../shell-content-block"
import { ShellTopNav } from "../shell-top-nav-block"
import { ShellLabelsColumn } from "./panel"
import { ShellLeftSidebar } from "./shell-left-sidebar"
import { useShellLeftSidebarDisplayMode } from "./use-shell-left-sidebar-display-mode"
import { useShellLeftSidebarNavigationModel } from "./use-shell-left-sidebar-navigation-model"

/**
 * Reserve horizontal space for the **icon rail only** so `SidebarInset` (top nav + main)
 * aligns flush with the minibar’s inner edge; the labels explorer is rendered beside it.
 */
const SHELL_SIDEBAR_PROVIDER_STYLE = {
  "--sidebar-width": "var(--sidebar-width-icon)",
} as const satisfies Record<string, string>

/** `/app` shell frame: minibar, top nav spanning from rail edge, labels explorer beside the content, `Outlet`. */
export function ShellLeftSidebarLayout() {
  const isGlobalOverlayEnabled = shellSlotActivationV1["shell.overlay.global"]
  const navModel = useShellLeftSidebarNavigationModel()
  const sidebarDisplay = useShellLeftSidebarDisplayMode()
  const contextBar = useShellContextBar()

  const handleLabelsBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      sidebarDisplay.setHoverIntentActive(false)
    }
  }

  return (
    <>
      {/* eslint-disable afenda-ui/no-inline-styles -- SidebarProvider merged --sidebar-width (icon rail only) */}
      <SidebarProvider
        defaultOpen
        style={SHELL_SIDEBAR_PROVIDER_STYLE as CSSProperties}
        className="h-svh min-h-0 overflow-hidden"
      >
        <ShellLeftSidebar
          model={navModel}
          displayMode={sidebarDisplay.mode}
          onDisplayModeChange={sidebarDisplay.setMode}
          onDisplayModeHoverIntentChange={sidebarDisplay.setHoverIntentActive}
          isDisplayExpanded={sidebarDisplay.expanded}
        />

        <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ShellTopNav
            leadingSlot={
              <SidebarTrigger className="-ml-0.5 shrink-0 md:hidden" />
            }
          />

          <div
            data-shell-left-sidebar-mode={sidebarDisplay.mode}
            data-shell-left-sidebar-expanded={
              sidebarDisplay.expanded ? "true" : "false"
            }
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            <ShellLabelsColumn
              model={navModel}
              className={cn(
                "absolute top-0 bottom-0 left-0 z-10 hidden min-h-0 w-80 shrink-0 overflow-hidden border-r border-sidebar-border transition-[transform,opacity] duration-150 ease-out md:flex",
                sidebarDisplay.expanded
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-full opacity-0"
              )}
              onPointerEnter={() => sidebarDisplay.setHoverIntentActive(true)}
              onPointerLeave={() => sidebarDisplay.setHoverIntentActive(false)}
              onFocusCapture={() => sidebarDisplay.setHoverIntentActive(true)}
              onBlurCapture={handleLabelsBlur}
            />

            <div className="ui-shell-main-column">
              <ShellContentBlock
                topSlot={
                  contextBar ? (
                    <div
                      data-slot="shell.content.top"
                      className="ui-shell-slot-top"
                    >
                      <ShellContextBar model={contextBar} />
                    </div>
                  ) : null
                }
              >
                <ShellOutletErrorBoundary>
                  <Outlet />
                </ShellOutletErrorBoundary>
              </ShellContentBlock>
            </div>
          </div>
        </SidebarInset>

        {isGlobalOverlayEnabled ? (
          <div data-slot="shell.overlay.global" className="ui-shell-overlay" />
        ) : null}
      </SidebarProvider>
      {/* eslint-enable afenda-ui/no-inline-styles */}
    </>
  )
}

/** Compatibility alias — same as {@link ShellLeftSidebarLayout}. */
export const AppShellLayout = ShellLeftSidebarLayout
