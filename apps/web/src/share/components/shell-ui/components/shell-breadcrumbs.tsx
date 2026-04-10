import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react"

import { cn } from "@afenda/shadcn-ui/lib/utils"

export type ShellBreadcrumbsProps = ComponentPropsWithoutRef<"nav">

/**
 * Governed header region for route / hierarchy breadcrumbs (`header.breadcrumbs` slot).
 * Compose with app routers or feature crumb rows; keeps `data-shell-key` stable for governance.
 */
export const ShellBreadcrumbs = forwardRef<
  ElementRef<"nav">,
  ShellBreadcrumbsProps
>(function ShellBreadcrumbs({ className, ...props }, ref) {
  return (
    <nav
      ref={ref}
      data-shell-zone="header"
      data-shell-key="shell-breadcrumbs"
      className={cn(
        "flex min-w-0 items-center gap-1 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
