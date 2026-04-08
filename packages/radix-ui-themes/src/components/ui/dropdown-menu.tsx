/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal
export const DropdownMenuSub = DropdownMenuPrimitive.Sub
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ref,
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps & {
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(defaultTheme.dropdownMenu.content, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  ref,
  ...props
}: DropdownMenuPrimitive.DropdownMenuItemProps & {
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(defaultTheme.dropdownMenu.item, className)}
      {...props}
    />
  )
}
export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ref,
  ...props
}: DropdownMenuPrimitive.DropdownMenuCheckboxItemProps & {
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      className={cn(defaultTheme.dropdownMenu.item, 'pl-8', className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}
export function DropdownMenuRadioItem({
  className,
  children,
  ref,
  ...props
}: DropdownMenuPrimitive.DropdownMenuRadioItemProps & {
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(defaultTheme.dropdownMenu.item, 'pl-8', className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}
export const DropdownMenuLabel = DropdownMenuPrimitive.Label
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator
export const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(defaultTheme.dropdownMenu.shortcut, className)}
    {...props}
  />
)
export const DropdownMenuSubTrigger = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubTriggerProps) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(defaultTheme.dropdownMenu.item, className)}
    {...props}
  >
    {props.children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
)
export const DropdownMenuSubContent = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubContentProps) => (
  <DropdownMenuPrimitive.SubContent
    className={cn(defaultTheme.dropdownMenu.content, className)}
    {...props}
  />
)
