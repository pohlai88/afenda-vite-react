/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export const Tabs = TabsPrimitive.Root

export function TabsList({
  className,
  ref,
  ...props
}: TabsPrimitive.TabsListProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(defaultTheme.tabs.list, className)}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ref,
  ...props
}: TabsPrimitive.TabsTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(defaultTheme.tabs.trigger, className)}
      {...props}
    />
  )
}

export function TabsContent({
  className,
  ref,
  ...props
}: TabsPrimitive.TabsContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(defaultTheme.tabs.content, className)}
      {...props}
    />
  )
}
