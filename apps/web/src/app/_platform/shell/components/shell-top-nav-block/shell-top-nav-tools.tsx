"use client"

import type { ReactNode } from "react"

import { Bell, CircleHelp, Gem, SquareTerminal } from "lucide-react"

import { Button, Separator } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

export type ShellTopNavToolsProps = {
  helpLabel: string
  insightsLabel: string
  terminalLabel: string
  appSwitcherLabel: string
  /** Rightmost control (e.g. account menu). */
  userMenu: ReactNode
  className?: string
}

const SHELL_TOP_NAV_ICON_BUTTON_CLASS =
  "relative rounded-full border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:border-border hover:bg-accent/40 hover:text-foreground"

export function ShellTopNavTools({
  helpLabel,
  insightsLabel,
  terminalLabel,
  appSwitcherLabel,
  userMenu,
  className,
}: ShellTopNavToolsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={SHELL_TOP_NAV_ICON_BUTTON_CLASS}
        aria-label={helpLabel}
      >
        <CircleHelp className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={SHELL_TOP_NAV_ICON_BUTTON_CLASS}
        aria-label={insightsLabel}
      >
        <Bell className="size-3.5" />
        <span
          className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive"
          aria-hidden
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={SHELL_TOP_NAV_ICON_BUTTON_CLASS}
        aria-label={terminalLabel}
      >
        <SquareTerminal className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={SHELL_TOP_NAV_ICON_BUTTON_CLASS}
        aria-label={appSwitcherLabel}
      >
        <Gem className="size-3.5" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      {userMenu}
    </div>
  )
}
