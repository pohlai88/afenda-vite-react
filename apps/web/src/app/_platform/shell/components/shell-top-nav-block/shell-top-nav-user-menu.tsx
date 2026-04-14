"use client"

import { UserRound } from "lucide-react"

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@afenda/design-system/ui-primitives"

import {
  type AppShellSidebarUserProfile,
  ShellUserAvatar,
  ShellUserMenuDropdownPanel,
  SHELL_USER_MENU_CONTENT_CLASS,
  SHELL_USER_MENU_DROPDOWN_CONTENT_PROPS,
} from "../shell-rail-sidebar-block/shell-rail-mini-sidebar"

export type ShellTopNavUserMenuProps = {
  user: AppShellSidebarUserProfile
}

export function ShellTopNavUserMenu({ user }: ShellTopNavUserMenuProps) {
  const hasAvatar = user.avatar.trim().length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full border border-border/70 bg-background/70 p-0 transition-colors hover:border-border hover:bg-accent/30"
          aria-label={user.name}
        >
          {hasAvatar ? (
            <ShellUserAvatar user={user} />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full">
              <UserRound className="size-4 text-muted-foreground" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={SHELL_USER_MENU_CONTENT_CLASS}
        side="bottom"
        {...SHELL_USER_MENU_DROPDOWN_CONTENT_PROPS}
      >
        <ShellUserMenuDropdownPanel user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
