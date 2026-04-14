"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Button,
  Kbd,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { SHELL_OPEN_COMMAND_PALETTE_EVENT } from "../../services/shell-command-palette-events"
import { useShellBreadcrumbs } from "../../hooks/use-shell-breadcrumbs"
import { useShellScopeLineage } from "../../hooks/use-shell-scope-lineage"
import { ShellScopeLineageBar } from "./shell-scope-lineage-bar"
import { ShellTopNavBreadcrumbs } from "./shell-top-nav-breadcrumbs"
import { ShellTopNavCommandDialog } from "./shell-top-nav-command-dialog"
import { ShellTopNavConnectPopover } from "./shell-top-nav-connect-popover"
import type { ShellTopNavProps } from "./shell-top-nav-types"
import type { AppShellSidebarUserProfile } from "../shell-rail-sidebar-block/shell-rail-mini-sidebar"
import { ShellTopNavTools } from "./shell-top-nav-tools"
import { ShellTopNavUserMenu } from "./shell-top-nav-user-menu"
import { useShellTopNavModKey } from "./use-shell-top-nav-mod-key"

/** Placeholder until shell auth/user context is wired (keep in sync with `ShellLeftSidebar`). */
const SHELL_TOP_NAV_FALLBACK_USER = {
  name: "Demo User",
  email: "demo@afenda.local",
  avatar: "",
} as const satisfies AppShellSidebarUserProfile

/**
 * Sticky workspace header: scope breadcrumbs, command palette (⌘K; Ctrl+K also opens on Windows), utilities, Connect (icon in the tool row).
 * Pass `leadingSlot` from the shell layout (e.g. mobile `SidebarTrigger`) so sidebar primitives stay in the layout layer.
 *
 * **Content sizing:** Strip height comes from `--size-shell-header-height` (see `index.css`) and `min-h-12`.
 * Toolbar controls use **36px** vertical rhythm (`h-9`, `Button` `size="icon"`, user trigger `size-9`) so icons and search stay aligned with room under the 3rem bar.
 */
export function ShellTopNav({
  className,
  leadingSlot,
  ...headerProps
}: ShellTopNavProps) {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const breadcrumbs = useShellBreadcrumbs()
  const scopeLineage = useShellScopeLineage()
  const mod = useShellTopNavModKey()
  const [commandOpen, setCommandOpen] = useState(false)
  const commandTooltip = t("top_nav.tooltip_command", {
    shortcut: `${mod}+K`,
  })

  const openCommand = useCallback(() => setCommandOpen(true), [])
  const closeCommand = useCallback(() => setCommandOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    const onOpen = () => setCommandOpen(true)
    window.addEventListener(SHELL_OPEN_COMMAND_PALETTE_EVENT, onOpen)
    return () =>
      window.removeEventListener(SHELL_OPEN_COMMAND_PALETTE_EVENT, onOpen)
  }, [])

  return (
    <TooltipProvider delayDuration={300}>
      <>
        <header
          data-slot="shell.top-nav"
          className={cn(
            "sticky top-0 z-40 ui-shell-header-strip flex min-h-12 w-full shrink-0 items-center gap-2 border-b border-border/80 bg-background/92 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:gap-3 md:px-4 lg:px-5",
            className
          )}
          {...headerProps}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-2.5">
            {leadingSlot}
            {scopeLineage.segments.length > 0 ? (
              <ShellScopeLineageBar
                model={scopeLineage}
                className="min-w-0 flex-1"
              />
            ) : (
              <ShellTopNavBreadcrumbs items={breadcrumbs} />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <div className="hidden sm:flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 max-w-30 shrink-0 rounded-full border-border/70 bg-background/70 px-2.5 text-left text-muted-foreground transition-colors hover:border-border hover:bg-accent/30 lg:max-w-36"
                    )}
                    aria-label={commandTooltip}
                    onClick={openCommand}
                  >
                    <Search
                      className="size-3 shrink-0 opacity-75"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {t("semantic_search.placeholder")}
                    </span>
                    <Kbd
                      className="ml-auto hidden h-5 min-w-0 shrink-0 px-1.5 font-sans text-[10px] tracking-tight tabular-nums sm:inline-flex"
                      aria-hidden
                    >
                      {`${mod}+K`}
                    </Kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  {commandTooltip}
                </TooltipContent>
              </Tooltip>
            </div>

            <ShellTopNavTools
              className="hidden sm:flex"
              connectSlot={<ShellTopNavConnectPopover />}
              feedbackLabel={t("feedback.aria_label")}
              helpLabel={t("help.tooltip")}
              insightsLabel={t("resolution.title")}
              terminalLabel={t("top_nav.terminal_aria")}
              appSwitcherLabel={t("top_nav.app_switcher_aria")}
              userMenu={
                <ShellTopNavUserMenu user={SHELL_TOP_NAV_FALLBACK_USER} />
              }
            />
          </div>
        </header>

        <ShellTopNavCommandDialog
          open={commandOpen}
          onOpenChange={setCommandOpen}
          title={t("command_palette.title")}
          description={t("command_palette.description")}
          inputPlaceholder={t("command_palette.placeholder")}
          emptyLabel={t("command_palette.empty")}
          groupNavLabel={t("command_palette.group_nav")}
          navItems={breadcrumbs}
          onSelectNavItem={(to) => {
            navigate(to)
            closeCommand()
          }}
        />
      </>
    </TooltipProvider>
  )
}
