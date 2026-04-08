/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import { cva } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'

export function NavigationMenu({
  className,
  children,
  ref,
  ...props
}: NavigationMenuPrimitive.NavigationMenuProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <NavigationMenuPrimitive.Root ref={ref} className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)} {...props}>
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
}

export function NavigationMenuList({ className, ref, ...props }: NavigationMenuPrimitive.NavigationMenuListProps & { ref?: Ref<HTMLUListElement> }) {
  return <NavigationMenuPrimitive.List ref={ref} className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)} {...props} />
}
export const NavigationMenuItem = NavigationMenuPrimitive.Item
export const NavigationMenuContent = NavigationMenuPrimitive.Content
export const NavigationMenuLink = NavigationMenuPrimitive.Link

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
)

export function NavigationMenuTrigger({
  className,
  children,
  ref,
  ...props
}: NavigationMenuPrimitive.NavigationMenuTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerStyle(), 'group', className)} {...props}>
      {children}
      <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
    </NavigationMenuPrimitive.Trigger>
  )
}

export function NavigationMenuViewport({
  className,
  ref,
  ...props
}: NavigationMenuPrimitive.NavigationMenuViewportProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div className={cn('absolute left-0 top-full flex justify-center')}>
      <NavigationMenuPrimitive.Viewport ref={ref} className={cn('relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=closed]:animate-out data-[state=open]:animate-in md:w-[var(--radix-navigation-menu-viewport-width)]', className)} {...props} />
    </div>
  )
}

export function NavigationMenuIndicator({
  className,
  ref,
  ...props
}: NavigationMenuPrimitive.NavigationMenuIndicatorProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <NavigationMenuPrimitive.Indicator ref={ref} className={cn('top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out', className)} {...props}>
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export { navigationMenuTriggerStyle }
