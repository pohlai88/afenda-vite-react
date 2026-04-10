import { type ComponentPropsWithoutRef, forwardRef } from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

export type ShellHeaderProps = ComponentPropsWithoutRef<"div">

/**
 * Top chrome region (`header` zone). Wraps the primary app header; inner surfaces may
 * render their own `<header>` — this wrapper is for layout + governance markers only.
 */
export const ShellHeader = forwardRef<HTMLDivElement, ShellHeaderProps>(
  function ShellHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-shell-zone="header"
        data-shell-key="shell-header"
        className={cn("shrink-0", className)}
        {...props}
      />
    )
  }
)
