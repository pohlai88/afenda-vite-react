import { type ComponentPropsWithoutRef, forwardRef } from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

export type ShellSidebarProps = ComponentPropsWithoutRef<"div">

/** Primary navigation chrome region (`sidebar` zone). Wraps the app sidebar rail. */
export const ShellSidebar = forwardRef<HTMLDivElement, ShellSidebarProps>(
  function ShellSidebar({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-shell-zone="sidebar"
        data-shell-key="shell-sidebar"
        className={cn("relative flex min-h-0 shrink-0", className)}
        {...props}
      />
    )
  }
)
