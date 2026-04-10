import { type ComponentPropsWithoutRef, forwardRef } from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

export type ShellContentProps = ComponentPropsWithoutRef<"div">

/** Primary routed content frame (`content` zone). Wraps the main scroll/split region. */
export const ShellContent = forwardRef<HTMLDivElement, ShellContentProps>(
  function ShellContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-shell-zone="content"
        data-shell-key="shell-content"
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}
        {...props}
      />
    )
  }
)
