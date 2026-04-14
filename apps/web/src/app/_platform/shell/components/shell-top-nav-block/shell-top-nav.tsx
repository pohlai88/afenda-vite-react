"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { MessageSquarePlus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button, Kbd, KbdGroup } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { useShellBreadcrumbs } from "../../hooks/use-shell-breadcrumbs"
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
 * Sticky workspace header: scope breadcrumbs, command palette (⌘/Ctrl+K), utilities, Connect.
 * Pass `leadingSlot` from the shell layout (e.g. mobile `SidebarTrigger`) so sidebar primitives stay in the layout layer.
 */
export function ShellTopNav({
  className,
  leadingSlot,
  ...headerProps
}: ShellTopNavProps) {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const breadcrumbs = useShellBreadcrumbs()
  const mod = useShellTopNavModKey()
  const [commandOpen, setCommandOpen] = useState(false)

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

  return (
    <>
      <header
        data-slot="shell.top-nav"
        className={cn(
          "ui-shell-header-strip sticky top-0 z-40 flex min-h-14 w-full shrink-0 items-center gap-2 border-b border-border/80 bg-background/92 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:gap-3 md:px-4 lg:px-5",
          className
        )}
        {...headerProps}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-2.5">
          {leadingSlot}
          <ShellTopNavBreadcrumbs items={breadcrumbs} />
          <div className="hidden shrink-0 items-center md:flex">
            <ShellTopNavConnectPopover />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden shrink-0 rounded-full border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:border-border hover:bg-accent/40 hover:text-foreground lg:inline-flex"
            aria-label={t("feedback.aria_label")}
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            <MessageSquarePlus className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "hidden h-9 max-w-[min(100%,15rem)] flex-1 rounded-full border-border/70 bg-background/70 px-3.5 text-left text-muted-foreground transition-colors hover:border-border hover:bg-accent/30 md:flex lg:max-w-sm"
            )}
            aria-label={t("semantic_search.placeholder")}
            onClick={openCommand}
          >
            <Search className="size-3.5 shrink-0 opacity-75" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm">
              {t("semantic_search.placeholder")}
            </span>
            <KbdGroup className="ml-auto hidden sm:inline-flex">
              <Kbd className="h-5 min-w-11 px-1.5 text-[10px]">
                {mod}+K
              </Kbd>
            </KbdGroup>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-full border border-border/70 bg-background/70 text-muted-foreground md:hidden"
            aria-label={t("semantic_search.placeholder")}
            onClick={openCommand}
          >
            <Search className="size-3.5" />
          </Button>

          <ShellTopNavTools
            className="hidden sm:flex"
            helpLabel={t("help.tooltip")}
            insightsLabel={t("resolution.title")}
            terminalLabel={t("top_nav.terminal_aria")}
            appSwitcherLabel={t("top_nav.app_switcher_aria")}
            userMenu={<ShellTopNavUserMenu user={SHELL_TOP_NAV_FALLBACK_USER} />}
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
  )
}
