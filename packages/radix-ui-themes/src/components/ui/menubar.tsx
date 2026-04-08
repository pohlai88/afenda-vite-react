/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as MenubarPrimitive from '@radix-ui/react-menubar'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export function Menubar({ className, ref, ...props }: MenubarPrimitive.MenubarProps & { ref?: Ref<HTMLDivElement> }) {
  return <MenubarPrimitive.Root ref={ref} className={cn('flex h-10 items-center space-x-1 rounded-md border bg-background p-1', className)} {...props} />
}
export function MenubarMenu(props: MenubarPrimitive.MenubarMenuProps) {
  return <MenubarPrimitive.Menu {...props} />
}
export const MenubarGroup = MenubarPrimitive.Group
export const MenubarPortal = MenubarPrimitive.Portal
export const MenubarSub = MenubarPrimitive.Sub
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup
export function MenubarTrigger({ className, ref, ...props }: MenubarPrimitive.MenubarTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  return <MenubarPrimitive.Trigger ref={ref} className={cn('flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent data-[state=open]:bg-accent', className)} {...props} />
}
export function MenubarContent({ className, ref, ...props }: MenubarPrimitive.MenubarContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content ref={ref} className={cn('z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props} />
    </MenubarPrimitive.Portal>
  )
}
export const MenubarItem = ({ className, ...props }: MenubarPrimitive.MenubarItemProps) => <MenubarPrimitive.Item className={cn(defaultTheme.nav.menuItem, className)} {...props} />
export function MenubarCheckboxItem({ className, children, checked, ref, ...props }: MenubarPrimitive.MenubarCheckboxItemProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <MenubarPrimitive.CheckboxItem ref={ref} checked={checked} className={cn(defaultTheme.nav.menuItem, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}
export function MenubarRadioItem({ className, children, ref, ...props }: MenubarPrimitive.MenubarRadioItemProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <MenubarPrimitive.RadioItem ref={ref} className={cn(defaultTheme.nav.menuItem, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}
export const MenubarLabel = MenubarPrimitive.Label
export const MenubarSeparator = MenubarPrimitive.Separator
export const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
export const MenubarSubTrigger = ({ className, children, ...props }: MenubarPrimitive.MenubarSubTriggerProps) => (
  <MenubarPrimitive.SubTrigger className={cn(defaultTheme.nav.menuItem, className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
)
export const MenubarSubContent = ({ className, ...props }: MenubarPrimitive.MenubarSubContentProps) => (
  <MenubarPrimitive.SubContent className={cn('z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props} />
)
