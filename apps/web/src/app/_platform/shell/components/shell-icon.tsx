import { Suspense } from "react"

import { IconLucide } from "@afenda/design-system/icons"
import { cn } from "@afenda/design-system/utils"

import type { ShellIconName } from "../constants/shell-icon-names"

const SHELL_ICON_CLASS = "size-4 shrink-0"

export type ShellIconProps = {
  readonly name: ShellIconName
  readonly className?: string
}

function ShellIconFallback(props: { readonly className?: string }) {
  const { className } = props

  return (
    <span
      aria-hidden
      className={cn("inline-block", SHELL_ICON_CLASS, className)}
    />
  )
}

/**
 * Renders a catalog `IconLucide` by name with Suspense + fallback.
 * Use anywhere in shell chrome (sidebar, top nav, secondary bars, etc.).
 */
export function ShellIcon({ name, className }: ShellIconProps) {
  return (
    <Suspense fallback={<ShellIconFallback className={className} />}>
      <IconLucide
        aria-hidden
        name={name}
        className={cn(SHELL_ICON_CLASS, className)}
      />
    </Suspense>
  )
}

/** Compatibility alias — same as {@link ShellIcon}. */
export const ShellNavIcon = ShellIcon

/** Compatibility alias — same as {@link ShellIconProps}. */
export type ShellNavIconProps = ShellIconProps
