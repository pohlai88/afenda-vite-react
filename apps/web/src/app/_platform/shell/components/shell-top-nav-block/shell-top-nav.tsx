"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { ExternalLink, Maximize2, Minimize2, Search } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  Button,
  Kbd,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { AUTH_ROUTES, authClient, useAfendaSession } from "../../../auth"
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
import { ShellAuthTrustBeacon } from "../shell-auth-trust-beacon"

function createFocusWindowFeatures() {
  const width = Math.max(1280, window.screen.availWidth)
  const height = Math.max(760, window.screen.availHeight)
  const left = 0
  const top = 0
  return `popup=yes,noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`
}

/** Fallback only if session is missing (should not occur when `/app` is wrapped in `RequireAuth`). */
const SHELL_TOP_NAV_FALLBACK_USER = {
  name: "Demo User",
  email: "demo@afenda.local",
  avatar: "",
} as const satisfies AppShellSidebarUserProfile

function profileFromSessionData(
  data: ReturnType<typeof useAfendaSession>["data"]
): AppShellSidebarUserProfile {
  const u = data?.user
  if (!u) {
    return SHELL_TOP_NAV_FALLBACK_USER
  }
  return {
    name: (u.name ?? u.email ?? "User").trim() || "User",
    email: (u.email ?? "").trim(),
    avatar: ("image" in u && typeof u.image === "string" ? u.image : "").trim(),
  }
}

/**
 * Sticky workspace header: scope breadcrumbs, command palette (⌘K; Ctrl+K also opens on Windows), utilities, Connect (icon in the tool row).
 * Pass `leadingSlot` from the shell layout (e.g. mobile `SidebarTrigger`) so sidebar primitives stay in the layout layer.
 *
 * **Content sizing:** Strip height comes from `--size-shell-header-height` (see `index.css`) and `min-h-12`.
 * Toolbar controls use **36px** vertical rhythm (`h-[2.25rem]`, `Button` `size="icon"`, user trigger `size-9`) so icons and search stay aligned with room under the 3rem bar.
 */
export function ShellTopNav({
  className,
  leadingSlot,
  focusMode = false,
  ...headerProps
}: ShellTopNavProps) {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const location = useLocation()
  const { data: sessionData } = useAfendaSession()
  const shellUser = useMemo(
    () => profileFromSessionData(sessionData),
    [sessionData]
  )
  const handleLogout = useCallback(() => {
    void (async () => {
      await authClient.signOut()
      navigate(AUTH_ROUTES.login, { replace: true })
    })()
  }, [navigate])
  const breadcrumbs = useShellBreadcrumbs()
  const scopeLineage = useShellScopeLineage()
  const mod = useShellTopNavModKey()
  const [commandOpen, setCommandOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== "undefined" && document.fullscreenElement !== null
  )
  const commandTooltip = t("top_nav.tooltip_command", {
    shortcut: `${mod}+K`,
  })
  const focusWindowLabel = t("top_nav.open_focus_window")
  const focusEnterFullscreenLabel = t("top_nav.enter_fullscreen")
  const focusExitFullscreenLabel = t("top_nav.exit_fullscreen")
  const focusExitModeLabel = t("top_nav.exit_focus_mode")
  const focusWindowHref = useMemo(() => {
    const params = new URLSearchParams(location.search)
    params.set("view", "focus")
    params.set("focusWindow", "1")
    const search = params.toString()
    return `${location.pathname}${search ? `?${search}` : ""}${location.hash}`
  }, [location.hash, location.pathname, location.search])

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

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement !== null)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  const openFocusWindow = useCallback(() => {
    window.open(
      focusWindowHref,
      "afenda-focus-window",
      createFocusWindowFeatures()
    )
  }, [focusWindowHref])

  const toggleFullscreen = useCallback(() => {
    if (!focusMode) {
      return
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
      return
    }
    void document.documentElement.requestFullscreen().catch(() => undefined)
  }, [focusMode])

  const exitFocusMode = useCallback(() => {
    const params = new URLSearchParams(location.search)
    params.delete("view")
    params.delete("focusWindow")
    const search = params.toString()
    navigate(
      {
        pathname: location.pathname,
        search: search ? `?${search}` : "",
        hash: location.hash,
      },
      { replace: true }
    )
  }, [location.hash, location.pathname, location.search, navigate])

  const focusHoverExpandHint = t("top_nav.focus_hover_expand_hint")

  return (
    <TooltipProvider delayDuration={300}>
      <>
        <div className={cn("sticky top-0 z-40", focusMode && "group/nav")}>
          <header
            data-slot="shell.top-nav"
            data-shell-focus-hover-header={focusMode ? "true" : undefined}
            title={focusMode ? focusHoverExpandHint : undefined}
            className={cn(
              "flex w-full shrink-0 border-b border-border-muted",
              focusMode
                ? cn(
                    "flex-col items-stretch justify-end gap-[0] py-0",
                    "min-h-2 border-border-muted/35 bg-linear-to-b from-border/45 to-transparent shadow-none",
                    "backdrop-blur-none transition-[min-height,background-color,box-shadow,border-color] duration-200 ease-out",
                    "motion-safe:transition-[min-height,background-color,box-shadow,border-color]",
                    "group-hover/nav:min-h-12! group-hover/nav:border-border-muted group-hover/nav:bg-[color-mix(in_oklab,var(--color-sidebar)_92%,transparent)] group-hover/nav:shadow-sm group-hover/nav:backdrop-blur-[18px]",
                    "group-focus-within/nav:min-h-12! group-focus-within/nav:border-border-muted group-focus-within/nav:bg-[color-mix(in_oklab,var(--color-sidebar)_92%,transparent)] group-focus-within/nav:shadow-sm group-focus-within/nav:backdrop-blur-[18px]",
                    "motion-reduce:min-h-12! motion-reduce:border-border-muted motion-reduce:bg-[color-mix(in_oklab,var(--color-sidebar)_92%,transparent)] motion-reduce:shadow-sm motion-reduce:backdrop-blur-[18px]",
                    "[@media(hover:none)]:min-h-12! [@media(hover:none)]:border-border-muted [@media(hover:none)]:bg-[color-mix(in_oklab,var(--color-sidebar)_92%,transparent)] [@media(hover:none)]:shadow-sm [@media(hover:none)]:backdrop-blur-[18px]"
                  )
                : "ui-shell-header-strip min-h-12 items-center gap-[0.5rem] px-3 md:gap-[0.75rem] md:px-4 lg:px-5",
              className
            )}
            {...headerProps}
          >
            {focusMode ? (
              <div
                className={cn(
                  "flex min-h-12 w-full items-center gap-[0.5rem] px-3 md:gap-[0.625rem] md:px-4 lg:px-5",
                  "max-h-0 min-h-0 overflow-hidden opacity-0 transition-[max-height,opacity,min-height] duration-200 ease-out",
                  "group-hover/nav:max-h-24! group-hover/nav:min-h-12! group-hover/nav:overflow-visible group-hover/nav:opacity-100",
                  "group-focus-within/nav:max-h-24! group-focus-within/nav:min-h-12! group-focus-within/nav:overflow-visible group-focus-within/nav:opacity-100",
                  "motion-reduce:max-h-24! motion-reduce:overflow-visible motion-reduce:opacity-100",
                  "[@media(hover:none)]:max-h-24! [@media(hover:none)]:overflow-visible [@media(hover:none)]:opacity-100"
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-[0.5rem] md:gap-[0.625rem]">
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

                <div className="flex shrink-0 items-center gap-[0.5rem] sm:gap-[0.625rem]">
                  <div className="hidden sm:flex">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-[2.25rem] max-w-30 shrink-0 rounded-full border-border-muted bg-card/70 px-2.5 text-left text-muted-foreground shadow-sm transition-colors hover:border-border hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:max-w-36"
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
                            className="ml-auto hidden h-[1.25rem] min-w-0 shrink-0 px-1.5 font-sans text-[10px] tracking-tight tabular-nums sm:inline-flex"
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
                    trustBeacon={<ShellAuthTrustBeacon />}
                    workspaceSlot={
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="relative rounded-full border border-border-muted bg-card/70 text-muted-foreground shadow-sm transition-colors hover:border-border hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={
                                isFullscreen
                                  ? focusExitFullscreenLabel
                                  : focusEnterFullscreenLabel
                              }
                              onClick={toggleFullscreen}
                            >
                              {isFullscreen ? (
                                <Minimize2
                                  className="size-4"
                                  strokeWidth={1.5}
                                  aria-hidden
                                />
                              ) : (
                                <Maximize2
                                  className="size-4"
                                  strokeWidth={1.5}
                                  aria-hidden
                                />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            {isFullscreen
                              ? focusExitFullscreenLabel
                              : focusEnterFullscreenLabel}
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-[2.25rem] rounded-full border-border-muted bg-card/70 px-3 text-xs text-muted-foreground shadow-sm transition-colors hover:border-border hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={exitFocusMode}
                        >
                          {focusExitModeLabel}
                        </Button>
                      </>
                    }
                    feedbackLabel={t("feedback.aria_label")}
                    helpLabel={t("help.tooltip")}
                    insightsLabel={t("resolution.title")}
                    terminalLabel={t("top_nav.terminal_aria")}
                    appSwitcherLabel={t("top_nav.app_switcher_aria")}
                    userMenu={
                      <ShellTopNavUserMenu
                        user={shellUser}
                        onLogout={handleLogout}
                      />
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex min-w-0 flex-1 items-center gap-[0.5rem] md:gap-[0.625rem]">
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

                <div className="flex shrink-0 items-center gap-[0.5rem] sm:gap-[0.625rem]">
                  <div className="hidden sm:flex">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-[2.25rem] max-w-30 shrink-0 rounded-full border-border-muted bg-card/70 px-2.5 text-left text-muted-foreground shadow-sm transition-colors hover:border-border hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:max-w-36"
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
                            className="ml-auto hidden h-[1.25rem] min-w-0 shrink-0 px-1.5 font-sans text-[10px] tracking-tight tabular-nums sm:inline-flex"
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
                    trustBeacon={<ShellAuthTrustBeacon />}
                    workspaceSlot={
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative rounded-full border border-border-muted bg-card/70 text-muted-foreground shadow-sm transition-colors hover:border-border hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={focusWindowLabel}
                            onClick={openFocusWindow}
                          >
                            <ExternalLink
                              className="size-4"
                              strokeWidth={1.5}
                              aria-hidden
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          {focusWindowLabel}
                        </TooltipContent>
                      </Tooltip>
                    }
                    feedbackLabel={t("feedback.aria_label")}
                    helpLabel={t("help.tooltip")}
                    insightsLabel={t("resolution.title")}
                    terminalLabel={t("top_nav.terminal_aria")}
                    appSwitcherLabel={t("top_nav.app_switcher_aria")}
                    userMenu={
                      <ShellTopNavUserMenu
                        user={shellUser}
                        onLogout={handleLogout}
                      />
                    }
                  />
                </div>
              </>
            )}
          </header>
        </div>

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
