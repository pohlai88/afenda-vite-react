import { type ComponentPropsWithoutRef, forwardRef } from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

export type ShellRootProps = ComponentPropsWithoutRef<"div">

/**
 * Canonical outer shell boundary (`root` zone). Compose inside providers such as
 * `SidebarProvider`; does not create shell metadata.
 */
export const ShellRoot = forwardRef<HTMLDivElement, ShellRootProps>(
  function ShellRoot({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-shell-zone="root"
        data-shell-key="shell-root"
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          className
        )}
        {...props}
      />
    )
  }
)
