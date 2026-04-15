import type { ComponentProps } from "react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown, MoreHorizontal, SlidersHorizontal } from "lucide-react"
import { NavLink } from "react-router-dom"

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type {
  ShellContextBarResolvedAction,
  ShellContextBarResolvedModel,
  ShellContextBarResolvedTab,
} from "../../contract/shell-context-bar-contract"
import { useShellCommandRunner } from "../../hooks/use-shell-command-runner"
import { useShellContextBarPreferences } from "../../hooks/use-shell-context-bar-preferences"
import { ShellIcon } from "../shell-icon"

const SHELL_CONTEXT_BAR_MOBILE_VISIBLE_TABS = 2
const SHELL_CONTEXT_BAR_MOBILE_VISIBLE_ACTIONS = 1

export interface ShellContextBarProps extends ComponentProps<"div"> {
  readonly model: ShellContextBarResolvedModel
  /** Compact presentation for focus / canvas modes: sections collapse to a menu; actions shrink. */
  readonly focusMode?: boolean
  readonly onCommandAction?: (commandId: string) => void
}

function ShellContextBarTab({
  tab,
  compact = false,
  onCommandAction,
}: {
  tab: ShellContextBarResolvedTab
  compact?: boolean
  onCommandAction: (commandId: string) => void
}) {
  const baseClassName = cn(
    "inline-flex h-[2rem] shrink-0 items-center gap-[0.375rem] rounded-md border-b-2 border-transparent px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/45 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
    tab.isActive && "border-primary text-foreground",
    tab.disabled && "pointer-events-none opacity-50",
    compact && "h-[1.75rem] px-2 text-xs"
  )

  if (tab.kind === "link" && tab.to) {
    return (
      <NavLink
        to={tab.to}
        aria-current={tab.isActive ? "page" : undefined}
        className={baseClassName}
      >
        <span className="truncate">{tab.label}</span>
        {tab.badgeCount !== undefined ? (
          <Badge
            variant="outline"
            className="h-[1rem] rounded-full px-1.5 text-[10px] leading-none"
          >
            {tab.badgeCount}
          </Badge>
        ) : null}
      </NavLink>
    )
  }

  return (
    <button
      type="button"
      disabled={tab.disabled || !tab.commandId}
      onClick={() => {
        if (tab.commandId) {
          onCommandAction(tab.commandId)
        }
      }}
      className={baseClassName}
    >
      <span className="truncate">{tab.label}</span>
      {tab.badgeCount !== undefined ? (
        <Badge
          variant="outline"
          className="h-[1rem] rounded-full px-1.5 text-[10px] leading-none"
        >
          {tab.badgeCount}
        </Badge>
      ) : null}
    </button>
  )
}

function ShellContextBarActionMenu({
  action,
  compact = false,
  onCommandAction,
}: {
  action: Extract<ShellContextBarResolvedAction, { presentation: "menu" }>
  compact?: boolean
  onCommandAction: (commandId: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-[0.375rem]", compact ? "h-[1.75rem]" : "h-[2rem]")}
          disabled={action.disabled}
        >
          <span className="truncate">{action.label}</span>
          <MoreHorizontal className="size-3.5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{action.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {action.menuItems.map((item) => {
            if (item.kind === "link" && item.to) {
              return (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  disabled={item.disabled}
                >
                  <NavLink to={item.to}>{item.label}</NavLink>
                </DropdownMenuItem>
              )
            }

            return (
              <DropdownMenuItem
                key={item.id}
                disabled={item.disabled || !item.commandId}
                onSelect={(event) => {
                  event.preventDefault()
                  if (item.commandId) {
                    onCommandAction(item.commandId)
                  }
                }}
              >
                {item.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ShellContextBarAction({
  action,
  compact = false,
  onCommandAction,
}: {
  action: ShellContextBarResolvedAction
  compact?: boolean
  onCommandAction: (commandId: string) => void
}) {
  if (action.presentation === "menu") {
    return (
      <ShellContextBarActionMenu
        action={action}
        compact={compact}
        onCommandAction={onCommandAction}
      />
    )
  }

  const content =
    action.presentation === "icon" ? (
      <>
        {action.iconName ? (
          <ShellIcon name={action.iconName} className="size-3.5" />
        ) : null}
        <span className="sr-only">{action.label}</span>
      </>
    ) : (
      <>
        {action.iconName ? (
          <ShellIcon name={action.iconName} className="size-3.5" />
        ) : null}
        <span className="truncate">{action.label}</span>
      </>
    )

  if (action.kind === "link" && action.to) {
    return (
      <Button
        asChild
        type="button"
        variant={action.presentation === "icon" ? "outline" : "secondary"}
        size={action.presentation === "icon" ? "icon-sm" : "sm"}
        className={cn(
          action.presentation === "icon"
            ? compact
              ? "size-7 min-h-7 min-w-7"
              : "h-[2rem]"
            : compact
              ? "h-[1.75rem] gap-[0.375rem]"
              : "h-[2rem] gap-[0.375rem]"
        )}
        disabled={action.disabled}
      >
        <NavLink to={action.to} aria-label={action.label}>
          {content}
        </NavLink>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={action.presentation === "icon" ? "outline" : "secondary"}
      size={action.presentation === "icon" ? "icon-sm" : "sm"}
      className={cn(
        action.presentation === "icon"
          ? compact
            ? "size-7 min-h-7 min-w-7"
            : "h-[2rem]"
          : compact
            ? "h-[1.75rem] gap-[0.375rem]"
            : "h-[2rem] gap-[0.375rem]"
      )}
      disabled={action.disabled || !action.commandId}
      aria-label={action.label}
      onClick={() => {
        if (action.commandId) {
          onCommandAction(action.commandId)
        }
      }}
    >
      {content}
    </Button>
  )
}

function ShellContextBarFocusTabs({
  model,
  onCommandAction,
}: {
  readonly model: ShellContextBarResolvedModel
  readonly onCommandAction: (commandId: string) => void
}) {
  const { t } = useTranslation("shell")

  if (model.tabs.length === 0) {
    return null
  }

  const activeTab = model.tabs.find((tab) => tab.isActive) ?? model.tabs[0]

  if (model.tabs.length === 1) {
    return (
      <div
        className="min-w-0 truncate text-sm font-medium text-foreground"
        title={activeTab.label}
      >
        {activeTab.label}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-[1.75rem] max-w-[min(100%,14rem)] gap-[0.25rem] px-2"
          aria-label={t("context_bar.sections_title")}
        >
          <span className="min-w-0 truncate">{activeTab.label}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuLabel>{t("context_bar.sections_title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {model.tabs.map((tab) =>
            tab.kind === "link" && tab.to ? (
              <DropdownMenuItem key={tab.id} asChild disabled={tab.disabled}>
                <NavLink to={tab.to}>{tab.label}</NavLink>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={tab.id}
                disabled={tab.disabled || !tab.commandId}
                onSelect={(event) => {
                  event.preventDefault()
                  if (tab.commandId) {
                    onCommandAction(tab.commandId)
                  }
                }}
              >
                {tab.label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ShellContextBarOverflowActionsList({
  actions,
  onCommandAction,
}: {
  readonly actions: readonly ShellContextBarResolvedAction[]
  readonly onCommandAction: (commandId: string) => void
}) {
  return actions.map((action) => {
    if (action.presentation === "menu") {
      return (
        <div key={action.id}>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">
            {action.label}
          </DropdownMenuLabel>
          {action.menuItems.map((item) =>
            item.kind === "link" && item.to ? (
              <DropdownMenuItem key={item.id} asChild disabled={item.disabled}>
                <NavLink to={item.to}>{item.label}</NavLink>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={item.id}
                disabled={item.disabled || !item.commandId}
                onSelect={(event) => {
                  event.preventDefault()
                  if (item.commandId) {
                    onCommandAction(item.commandId)
                  }
                }}
              >
                {item.label}
              </DropdownMenuItem>
            )
          )}
        </div>
      )
    }

    if (action.kind === "link" && action.to) {
      return (
        <DropdownMenuItem key={action.id} asChild disabled={action.disabled}>
          <NavLink to={action.to}>{action.label}</NavLink>
        </DropdownMenuItem>
      )
    }

    return (
      <DropdownMenuItem
        key={action.id}
        disabled={action.disabled || !action.commandId}
        onSelect={(event) => {
          event.preventDefault()
          if (action.commandId) {
            onCommandAction(action.commandId)
          }
        }}
      >
        {action.label}
      </DropdownMenuItem>
    )
  })
}

export function ShellContextBar({
  model,
  focusMode = false,
  onCommandAction: onCommandActionProp,
  className,
  ...divProps
}: ShellContextBarProps) {
  const { t } = useTranslation("shell")
  const runCommand = useShellCommandRunner()

  const onCommandAction = (commandId: string) => {
    if (onCommandActionProp) {
      onCommandActionProp(commandId)
      return
    }

    void runCommand({
      commandId,
      intent: "header-action",
    })
  }

  const actionIds = useMemo(
    () => model.actions.map((action) => action.id),
    [model.actions]
  )
  const {
    visibleActionIds,
    isActionVisible,
    toggleActionVisibility,
    showAllActions,
  } = useShellContextBarPreferences(actionIds)

  const visibleActions = model.actions.filter((action) =>
    visibleActionIds.includes(action.id)
  )

  const mobileVisibleTabs = model.tabs.filter(
    (tab) => tab.visibility === "always"
  )
  const mobileInlineTabs = mobileVisibleTabs.slice(
    0,
    SHELL_CONTEXT_BAR_MOBILE_VISIBLE_TABS
  )
  const mobileOverflowTabs = mobileVisibleTabs.slice(
    SHELL_CONTEXT_BAR_MOBILE_VISIBLE_TABS
  )

  const mobileVisibleActions = visibleActions.filter(
    (action) => action.visibility === "always"
  )
  const mobileInlineActions = mobileVisibleActions.slice(
    0,
    SHELL_CONTEXT_BAR_MOBILE_VISIBLE_ACTIONS
  )
  const mobileOverflowActions = mobileVisibleActions.slice(
    SHELL_CONTEXT_BAR_MOBILE_VISIBLE_ACTIONS
  )

  const hasMobileOverflow =
    mobileOverflowTabs.length > 0 || mobileOverflowActions.length > 0

  return (
    <div
      {...divProps}
      data-slot="shell.context-bar"
      data-focus-mode={focusMode ? "true" : undefined}
      className={cn(
        "flex ui-shell-context-bar min-w-0 items-center justify-between gap-[0.5rem] md:gap-[0.75rem]",
        focusMode && "min-h-8 gap-[0.375rem] py-0.5 md:gap-[0.5rem]",
        className
      )}
    >
      {focusMode ? (
        <div className="flex min-h-0 min-w-0 flex-1 items-center">
          <ShellContextBarFocusTabs
            model={model}
            onCommandAction={onCommandAction}
          />
        </div>
      ) : (
        <nav
          aria-label={t("context_bar.navigation_aria")}
          className="ui-scrollbar-hidden flex min-w-0 flex-1 items-center gap-[0.25rem] overflow-x-auto"
        >
          {model.tabs.map((tab, index) => {
            const showOnMobile = index < SHELL_CONTEXT_BAR_MOBILE_VISIBLE_TABS
            const mobileClassName =
              tab.visibility === "desktop-only"
                ? "hidden md:inline-flex"
                : showOnMobile
                  ? "inline-flex"
                  : "hidden md:inline-flex"

            return (
              <div key={tab.id} className={mobileClassName}>
                <ShellContextBarTab
                  tab={tab}
                  onCommandAction={onCommandAction}
                />
              </div>
            )
          })}
        </nav>
      )}

      <div
        className={cn(
          "flex shrink-0 items-center gap-[0.375rem]",
          focusMode && "min-w-0"
        )}
      >
        {visibleActions.map((action, index) => {
          const showOnMobile = index < SHELL_CONTEXT_BAR_MOBILE_VISIBLE_ACTIONS
          const mobileClassName =
            action.visibility === "desktop-only"
              ? "hidden md:inline-flex"
              : showOnMobile
                ? "inline-flex"
                : "hidden md:inline-flex"

          return (
            <div key={action.id} className={mobileClassName}>
              <ShellContextBarAction
                action={action}
                compact={focusMode}
                onCommandAction={onCommandAction}
              />
            </div>
          )
        })}

        {model.actions.length > 1 && !focusMode ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hidden h-[2rem] w-[2rem] md:inline-flex"
                aria-label={t("context_bar.customize_aria")}
              >
                <SlidersHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuLabel>
                {t("context_bar.customize_title")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {model.actions.map((action) => (
                  <DropdownMenuCheckboxItem
                    key={action.id}
                    checked={isActionVisible(action.id)}
                    onSelect={(event) => {
                      event.preventDefault()
                    }}
                    onCheckedChange={() => {
                      toggleActionVisibility(action.id)
                    }}
                  >
                    {action.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  showAllActions()
                }}
              >
                {t("context_bar.show_all_actions")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {hasMobileOverflow && !focusMode ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="h-[2rem] w-[2rem] md:hidden"
                aria-label={t("context_bar.more_aria")}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56 md:hidden">
              {mobileOverflowTabs.length > 0 ? (
                <>
                  <DropdownMenuLabel>
                    {t("context_bar.sections_title")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {mobileOverflowTabs.map((tab) =>
                      tab.kind === "link" && tab.to ? (
                        <DropdownMenuItem
                          key={tab.id}
                          asChild
                          disabled={tab.disabled}
                        >
                          <NavLink to={tab.to}>{tab.label}</NavLink>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          key={tab.id}
                          disabled={tab.disabled || !tab.commandId}
                          onSelect={(event) => {
                            event.preventDefault()
                            if (tab.commandId) {
                              onCommandAction(tab.commandId)
                            }
                          }}
                        >
                          {tab.label}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuGroup>
                </>
              ) : null}

              {mobileOverflowActions.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>
                    {t("context_bar.actions_title")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <ShellContextBarOverflowActionsList
                      actions={mobileOverflowActions}
                      onCommandAction={onCommandAction}
                    />
                  </DropdownMenuGroup>
                </>
              ) : null}

              {mobileInlineTabs.length > 0 || mobileInlineActions.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                    }}
                    disabled
                  >
                    {t("context_bar.inline_visible_hint")}
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {focusMode && mobileOverflowActions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="h-[1.75rem] w-[1.75rem] md:hidden"
                aria-label={t("context_bar.more_aria")}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56 md:hidden">
              <DropdownMenuLabel>
                {t("context_bar.actions_title")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <ShellContextBarOverflowActionsList
                  actions={mobileOverflowActions}
                  onCommandAction={onCommandAction}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  )
}
