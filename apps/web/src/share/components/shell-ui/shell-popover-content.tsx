import type { ComponentProps } from 'react'

import { PopoverContent } from '@afenda/ui/components/ui/popover'
import { cn } from '@afenda/ui/lib/utils'

type PopoverContentComponentProps = ComponentProps<typeof PopoverContent>

/** Anchor + collision defaults for popovers opened from the top-nav right icon rail. */
export const shellTopRailPopoverAnchor: Pick<
  PopoverContentComponentProps,
  'align' | 'side' | 'sideOffset' | 'collisionPadding'
> = {
  align: 'end',
  side: 'bottom',
  sideOffset: 6,
  collisionPadding: 16,
}

/** Anchor + collision defaults for popovers opened from the scope strip (left of top nav). */
export const shellScopeStripPopoverAnchor: Pick<
  PopoverContentComponentProps,
  'align' | 'side' | 'sideOffset' | 'collisionPadding'
> = {
  align: 'start',
  side: 'bottom',
  sideOffset: 6,
  collisionPadding: 16,
}

export type ShellPopoverVariant = 'topRail' | 'scopeStrip' | 'none'

const VARIANT_ANCHOR: Record<
  Exclude<ShellPopoverVariant, 'none'>,
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
  shellVariant = 'none',
  align,
  side,
  sideOffset,
  collisionPadding,
  className,
  ...props
}: ShellPopoverContentProps) {
  const anchor =
    shellVariant === 'none' ? undefined : VARIANT_ANCHOR[shellVariant]

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
