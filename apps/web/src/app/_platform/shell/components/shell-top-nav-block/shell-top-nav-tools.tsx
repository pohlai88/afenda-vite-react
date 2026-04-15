"use client"

import type { ReactNode } from "react"

import {
  Bell,
  CircleHelp,
  LayoutGrid,
  MessageSquareMore,
  SquareTerminal,
} from "lucide-react"

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

export type ShellTopNavToolsProps = {
  /** Optional leading control (e.g. Connect) using the same circular icon chrome as the tool row. */
  connectSlot?: ReactNode
  /** Optional trust indicator shown before utilities. */
  trustBeacon?: ReactNode
  /** Optional workspace controls (e.g. open focus window / fullscreen). */
  workspaceSlot?: ReactNode
  feedbackLabel: string
  helpLabel: string
  insightsLabel: string
  terminalLabel: string
  appSwitcherLabel: string
  /** Rightmost control (e.g. account menu). */
  userMenu: ReactNode
  className?: string
}

/** Shared with `ShellTopNavConnectPopover` so Connect matches the tool icons. */
export const SHELL_TOP_NAV_ICON_BUTTON_CLASS =
  "relative rounded-full border border-border-muted bg-card/70 text-muted-foreground shadow-sm transition-colors hover:border-border hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

type IconToolProps = {
  label: string
  children: ReactNode
}

function ShellTopNavIconTool({ label, children }: IconToolProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={SHELL_TOP_NAV_ICON_BUTTON_CLASS}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function ShellTopNavTools({
  connectSlot,
  trustBeacon,
  workspaceSlot,
  feedbackLabel,
  helpLabel,
  insightsLabel,
  terminalLabel,
  appSwitcherLabel,
  userMenu,
  className,
}: ShellTopNavToolsProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", className)}
    >
      <div className="flex items-center gap-1.5">{connectSlot}</div>
      {trustBeacon ? (
        <div className="flex items-center gap-1.5">{trustBeacon}</div>
      ) : null}
      <span className="h-5 w-px shrink-0 bg-border-muted" aria-hidden />
      <div className="flex items-center gap-1.5">
        <ShellTopNavIconTool label={feedbackLabel}>
          <MessageSquareMore className="size-4" strokeWidth={1.5} />
        </ShellTopNavIconTool>
        <ShellTopNavIconTool label={helpLabel}>
          <CircleHelp className="size-4" strokeWidth={1.5} />
        </ShellTopNavIconTool>
        <ShellTopNavIconTool label={insightsLabel}>
          <>
            <Bell className="size-4" strokeWidth={1.5} />
            <span
              className="absolute top-1 right-1 size-1.5 rounded-full bg-destructive"
              aria-hidden
            />
          </>
        </ShellTopNavIconTool>
      </div>
      <span className="h-5 w-px shrink-0 bg-border-muted" aria-hidden />
      <div className="flex items-center gap-1.5">
        <ShellTopNavIconTool label={terminalLabel}>
          <SquareTerminal className="size-4" strokeWidth={1.5} />
        </ShellTopNavIconTool>
        <ShellTopNavIconTool label={appSwitcherLabel}>
          <LayoutGrid className="size-4" strokeWidth={1.5} />
        </ShellTopNavIconTool>
      </div>
      {workspaceSlot ? (
        <>
          <span className="h-5 w-px shrink-0 bg-border-muted" aria-hidden />
          <div className="flex items-center gap-1.5">{workspaceSlot}</div>
        </>
      ) : null}
      <span className="h-5 w-px shrink-0 bg-border-muted" aria-hidden />
      {userMenu}
    </div>
  )
}
