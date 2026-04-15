"use client"

import { PanelLeft } from "lucide-react"
import type { FocusEvent, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "@afenda/design-system/ui-primitives"

import { shellSlotActivationV1 } from "../../policy/shell-navigation-policy"
import type { ShellLeftSidebarDisplayMode } from "../shell-left-sidebar-block/shell-left-sidebar-display-mode"
import { AppShellSidebarBrandRail } from "./shell-rail-mini-sidebar"

const SHELL_ICON_RAIL_CLASS =
  "ui-shell-icon-rail hidden h-full w-(--sidebar-width-icon) shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm md:flex"

const isSidebarFooterEnabled = shellSlotActivationV1["shell.sidebar.footer"]

export type AppShellSidebarRailColumnProps = {
  /** Rendered rail rows (emoji links, customize slot, etc.). */
  railWidgets: ReactNode
  displayMode: ShellLeftSidebarDisplayMode
  onDisplayModeChange: (nextMode: ShellLeftSidebarDisplayMode) => void
  onDisplayModeHoverIntentChange: (active: boolean) => void
  isDisplayExpanded: boolean
}

/**
 * Desktop-only labels panel control.
 * Rail stays static; this menu selects widescreen labels behavior.
 */
function AppShellSidebarRailDisplayModeFooter({
  displayMode,
  onDisplayModeChange,
  isDisplayExpanded,
}: Pick<
  AppShellSidebarRailColumnProps,
  "displayMode" | "onDisplayModeChange" | "isDisplayExpanded"
>) {
  const { t } = useTranslation("shell")

  return (
    <SidebarFooter
      data-slot="shell.sidebar.footer"
      className="mt-auto shrink-0 border-t border-sidebar-border ui-shell-sidebar-footer-slot"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-slot="shell.sidebar.rail-toggle"
            variant="ghost"
            size="icon-sm"
            className="mx-auto flex w-full max-w-10 rounded-lg hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label={t("sidebar.control_title")}
            aria-expanded={isDisplayExpanded}
          >
            <PanelLeft className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          side="right"
          className="w-48"
          data-slot="shell.sidebar.mode-menu"
        >
          <DropdownMenuLabel>{t("sidebar.control_title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={displayMode}
            onValueChange={(value) => {
              if (
                value === "expanded" ||
                value === "collapsed" ||
                value === "hover"
              ) {
                onDisplayModeChange(value)
              }
            }}
          >
            <DropdownMenuRadioItem value="expanded">
              {t("sidebar.mode_expanded")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="collapsed">
              {t("sidebar.mode_collapsed")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hover">
              {t("sidebar.mode_hover")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  )
}

function handleBlurIntent(
  event: FocusEvent<HTMLDivElement>,
  onDisplayModeHoverIntentChange: AppShellSidebarRailColumnProps["onDisplayModeHoverIntentChange"]
) {
  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
    onDisplayModeHoverIntentChange(false)
  }
}

/**
 * Narrow icon rail (desktop):
 * - brand
 * - rail widgets
 * - footer: labels display mode menu (account menu lives in the top nav)
 *
 * This component remains compositional only.
 */
export function AppShellSidebarRailColumn({
  railWidgets,
  displayMode,
  onDisplayModeChange,
  onDisplayModeHoverIntentChange,
  isDisplayExpanded,
}: AppShellSidebarRailColumnProps) {
  return (
    <div
      data-shell-icon-rail
      className={SHELL_ICON_RAIL_CLASS}
      onPointerEnter={() => onDisplayModeHoverIntentChange(true)}
      onPointerLeave={() => onDisplayModeHoverIntentChange(false)}
      onFocusCapture={() => onDisplayModeHoverIntentChange(true)}
      onBlurCapture={(event) =>
        handleBlurIntent(event, onDisplayModeHoverIntentChange)
      }
    >
      <SidebarHeader className="shrink-0 gap-0 border-0 p-2">
        <div className="flex justify-center">
          <AppShellSidebarBrandRail />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-1 flex-col gap-1 overflow-auto px-1 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>{railWidgets}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {isSidebarFooterEnabled ? (
        <AppShellSidebarRailDisplayModeFooter
          displayMode={displayMode}
          onDisplayModeChange={onDisplayModeChange}
          isDisplayExpanded={isDisplayExpanded}
        />
      ) : null}
    </div>
  )
}
