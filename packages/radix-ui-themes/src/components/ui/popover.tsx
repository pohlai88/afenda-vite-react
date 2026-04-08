/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ref,
  ...props
}: PopoverPrimitive.PopoverContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(defaultTheme.overlay.popover, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
