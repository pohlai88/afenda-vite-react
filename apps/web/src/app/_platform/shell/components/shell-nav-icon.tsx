import { Suspense } from "react"

import { IconLucide } from "@afenda/design-system/icons"

import { cn } from "@afenda/design-system/utils"

import type { ShellNavIconName } from "../constants/shell-nav-icon-names"

export function ShellNavIcon({
  name,
  className,
}: {
  readonly name: ShellNavIconName
  readonly className?: string
}) {
  return (
    <Suspense
      fallback={
        <span aria-hidden className={cn("size-4 shrink-0", className)} />
      }
    >
      <IconLucide
        aria-hidden
        className={cn("size-4 shrink-0", className)}
        name={name}
      />
    </Suspense>
  )
}
