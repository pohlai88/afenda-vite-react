import type * as React from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

/** Screen-reader-only text; prefer this over raw `className="sr-only"` in governed UI. */
export function VisuallyHidden({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span className={cn("sr-only", className)} {...props} />
}
