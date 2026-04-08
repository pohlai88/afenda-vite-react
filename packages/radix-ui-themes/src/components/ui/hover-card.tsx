/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import { cn } from '../../lib/utils/cn.js'

export const HoverCard = HoverCardPrimitive.Root
export const HoverCardTrigger = HoverCardPrimitive.Trigger

export function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ref,
  ...props
}: HoverCardPrimitive.HoverCardContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn('z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md', className)}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}
