import type { ComponentProps, ReactNode } from "react"

import { cn } from "@afenda/design-system/utils"

export interface ShellContentBlockProps extends ComponentProps<"section"> {
  readonly topSlot?: ReactNode
  readonly scrollAreaClassName?: string
  readonly focusMode?: boolean
}

/**
 * Shell content frame with fixed horizontal bounds:
 * - optional top slot (non-scrolling)
 * - dedicated vertical scroll viewport for route content
 */
export function ShellContentBlock({
  className,
  topSlot,
  scrollAreaClassName,
  focusMode = false,
  children,
  ...sectionProps
}: ShellContentBlockProps) {
  return (
    <section
      data-slot="shell.content-block"
      data-shell-focus-mode={focusMode ? "true" : undefined}
      className={cn(
        "ui-shell-content-frame ui-shell-canvas",
        focusMode && "ui-shell-content-frame-focus",
        className
      )}
      {...sectionProps}
    >
      {topSlot ? <div className="shrink-0">{topSlot}</div> : null}

      <main
        data-slot="shell.content-scroll"
        className={cn(
          "ui-shell-content ui-shell-content-scroll",
          scrollAreaClassName
        )}
      >
        {children}
      </main>
    </section>
  )
}
