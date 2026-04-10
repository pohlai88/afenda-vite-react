import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react"

import { Skeleton } from "@afenda/shadcn-ui/components/ui/skeleton"
import { cn } from "@afenda/shadcn-ui/lib/utils"

export interface ShellLoadingFrameProps extends ComponentPropsWithoutRef<"div"> {
  /** Accessible name for the busy region (defaults to a generic loading label). */
  loadingLabel?: string
  /** When set, replaces the default skeleton blocks (e.g. feature-specific loading UI). */
  children?: ReactNode
}

/**
 * Canonical shell loading surface (`content.main` occupant). Use while route or shell data resolves.
 */
export const ShellLoadingFrame = forwardRef<
  HTMLDivElement,
  ShellLoadingFrameProps
>(function ShellLoadingFrame(
  { className, loadingLabel = "Loading", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="status"
      aria-busy
      aria-live="polite"
      aria-label={loadingLabel}
      data-shell-zone="content"
      data-shell-key="shell-loading-frame"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <Skeleton className="h-8 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-full max-w-2xl flex-1" />
          <Skeleton className="h-4 w-5/6 max-w-xl" />
        </>
      )}
    </div>
  )
})
