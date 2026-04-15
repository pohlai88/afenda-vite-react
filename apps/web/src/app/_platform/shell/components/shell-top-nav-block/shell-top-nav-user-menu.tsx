"use client"

import { CircleUserRound } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import {
  type AppShellSidebarUserProfile,
  ShellUserAvatar,
  ShellUserMenuDropdownPanel,
  SHELL_USER_MENU_CONTENT_CLASS,
  SHELL_USER_MENU_DROPDOWN_CONTENT_PROPS,
} from "../shell-rail-sidebar-block/shell-rail-mini-sidebar"

export type ShellTopNavUserMenuProps = {
  user: AppShellSidebarUserProfile
  onLogout?: () => void
}

const SHELL_TOP_NAV_USER_TRIGGER_CLASS =
  "group relative size-9 rounded-full border border-border/70 bg-background/70 p-0 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-150 hover:border-border hover:bg-accent/15 hover:shadow-[0_0_0_1px_hsl(var(--border)/0.45)] data-[state=open]:border-border data-[state=open]:bg-accent/15"

export function ShellTopNavUserMenu({
  user,
  onLogout,
}: ShellTopNavUserMenuProps) {
  const { t } = useTranslation("shell")
  const hasAvatar = user.avatar.trim().length > 0
  const menuLabel = t("top_nav.user_menu_aria")

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className={cn(
                SHELL_TOP_NAV_USER_TRIGGER_CLASS,
                "overflow-hidden"
              )}
              aria-label={menuLabel}
            >
              {hasAvatar ? (
                <ShellUserAvatar user={user} className="size-9" />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-background/75">
                  <CircleUserRound
                    className="size-[17px] text-foreground/70"
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {menuLabel}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        className={SHELL_USER_MENU_CONTENT_CLASS}
        side="bottom"
        {...SHELL_USER_MENU_DROPDOWN_CONTENT_PROPS}
      >
        <ShellUserMenuDropdownPanel user={user} onLogout={onLogout} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
