import * as React from "react"

import { cn } from "@/lib/utils"

export type LegacyTextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>

const customClasses = ["bg-control"]

/** Alternate textarea styling (`bg-control`, `min-h-10`) from legacy Supabase UI. */
const LegacyTextArea = React.forwardRef<HTMLTextAreaElement, LegacyTextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-control bg-control text-foreground placeholder:text-foreground-muted flex min-h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:ring-background-control focus-visible:ring-offset-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          ...customClasses,
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

LegacyTextArea.displayName = "LegacyTextArea"

export { LegacyTextArea }
