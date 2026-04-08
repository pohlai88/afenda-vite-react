/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({
  className,
  sideOffset = 4,
  ref,
  ...props
}: TooltipPrimitive.TooltipContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn(defaultTheme.overlay.tooltip, className)} {...props} />
    </TooltipPrimitive.Portal>
  )
}
