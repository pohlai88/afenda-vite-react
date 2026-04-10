import { type ComponentPropsWithoutRef, forwardRef } from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

export type ShellOverlayContainerProps = ComponentPropsWithoutRef<"div">

/**
 * Stacking context for shell chrome so overlays/popovers layer predictably above content.
 * Does not replace Radix portals — use as an isolate wrapper around the main shell subtree.
 */
export const ShellOverlayContainer = forwardRef<
  HTMLDivElement,
  ShellOverlayContainerProps
>(function ShellOverlayContainer({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-shell-zone="overlay"
      data-shell-key="shell-overlay-container"
      className={cn("relative isolate", className)}
      {...props}
    />
  )
})
