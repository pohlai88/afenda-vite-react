import type { ComponentProps } from "react"

import { PopoverContent } from "@afenda/shadcn-ui/components/ui/popover"
import { cn } from "@afenda/shadcn-ui/lib/utils"

import {
  shellScopeStripPopoverAnchor,
  shellTopRailPopoverAnchor,
} from "./shell-popover-anchor"

type PopoverContentComponentProps = ComponentProps<typeof PopoverContent>

export type ShellPopoverVariant = "topRail" | "scopeStrip" | "none"

const VARIANT_ANCHOR: Record<
  Exclude<ShellPopoverVariant, "none">,
  typeof shellTopRailPopoverAnchor
> = {
  topRail: shellTopRailPopoverAnchor,
  scopeStrip: shellScopeStripPopoverAnchor,
}

export interface ShellPopoverContentProps extends PopoverContentComponentProps {
  /** Merges standardized anchor defaults; explicit props still win. */
  shellVariant?: ShellPopoverVariant
}

/**
 * {@link PopoverContent} with shared shell defaults for top-nav anchored surfaces.
 * Use `shellVariant="none"` to opt out (still a thin forwarder if you only want `className` helpers).
 */
export function ShellPopoverContent({
  shellVariant = "none",
  align,
  side,
  sideOffset,
  collisionPadding,
  className,
  ...props
}: ShellPopoverContentProps) {
  const anchor =
    shellVariant === "none" ? undefined : VARIANT_ANCHOR[shellVariant]

  return (
    <PopoverContent
      align={align ?? anchor?.align}
      side={side ?? anchor?.side}
      sideOffset={sideOffset ?? anchor?.sideOffset}
      collisionPadding={collisionPadding ?? anchor?.collisionPadding}
      className={cn(className)}
      {...props}
    />
  )
}
