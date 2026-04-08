/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuGroup = ContextMenuPrimitive.Group
export const ContextMenuPortal = ContextMenuPrimitive.Portal
export const ContextMenuSub = ContextMenuPrimitive.Sub
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

export function ContextMenuContent({
  className,
  ref,
  ...props
}: ContextMenuPrimitive.ContextMenuContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content ref={ref} className={cn('z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props} />
    </ContextMenuPrimitive.Portal>
  )
}
export const ContextMenuItem = ({ className, ...props }: ContextMenuPrimitive.ContextMenuItemProps) => (
  <ContextMenuPrimitive.Item className={cn(defaultTheme.nav.menuItem, className)} {...props} />
)
export function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ref,
  ...props
}: ContextMenuPrimitive.ContextMenuCheckboxItemProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <ContextMenuPrimitive.CheckboxItem ref={ref} checked={checked} className={cn(defaultTheme.nav.menuItem, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}
export function ContextMenuRadioItem({
  className,
  children,
  ref,
  ...props
}: ContextMenuPrimitive.ContextMenuRadioItemProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <ContextMenuPrimitive.RadioItem ref={ref} className={cn(defaultTheme.nav.menuItem, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}
export const ContextMenuLabel = ContextMenuPrimitive.Label
export const ContextMenuSeparator = ContextMenuPrimitive.Separator
export const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
)
export const ContextMenuSubTrigger = ({ className, ...props }: ContextMenuPrimitive.ContextMenuSubTriggerProps) => (
  <ContextMenuPrimitive.SubTrigger className={cn(defaultTheme.nav.menuItem, className)} {...props}>
    {props.children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
)
export const ContextMenuSubContent = ({ className, ...props }: ContextMenuPrimitive.ContextMenuSubContentProps) => (
  <ContextMenuPrimitive.SubContent className={cn('z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props} />
)
