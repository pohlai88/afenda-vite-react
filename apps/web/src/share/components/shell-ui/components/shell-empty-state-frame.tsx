import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

export interface ShellEmptyStateFrameProps extends ComponentPropsWithoutRef<"div"> {
  /** Primary message (e.g. “No data yet”). */
  title: string
  /** Optional supporting copy. */
  description?: string
  /** Actions or illustration (buttons, links). */
  children?: ReactNode
}

/**
 * Canonical empty / no-data shell surface (`content.main` occupant). Mutually exclusive with
 * loading or error surfaces at the route level — compose only one primary state frame at a time.
 */
export const ShellEmptyStateFrame = forwardRef<
  HTMLDivElement,
  ShellEmptyStateFrameProps
>(function ShellEmptyStateFrame(
  { className, title, description, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label={title}
      data-shell-zone="content"
      data-shell-key="shell-empty-state-frame"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-2 p-8 text-center",
        className
      )}
      {...props}
    >
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  )
})
