import type { ComponentProps } from "react"
import type { PopoverContent } from "@afenda/shadcn-ui/components/ui/popover"

type PopoverContentComponentProps = ComponentProps<typeof PopoverContent>

/** Anchor + collision defaults for popovers opened from the top-nav right icon rail. */
export const shellTopRailPopoverAnchor: Pick<
  PopoverContentComponentProps,
  "align" | "side" | "sideOffset" | "collisionPadding"
> = {
  align: "end",
  side: "bottom",
  sideOffset: 6,
  collisionPadding: 16,
}

/** Anchor + collision defaults for popovers opened from the scope strip (left of top nav). */
export const shellScopeStripPopoverAnchor: Pick<
  PopoverContentComponentProps,
  "align" | "side" | "sideOffset" | "collisionPadding"
> = {
  align: "start",
  side: "bottom",
  sideOffset: 6,
  collisionPadding: 16,
}
