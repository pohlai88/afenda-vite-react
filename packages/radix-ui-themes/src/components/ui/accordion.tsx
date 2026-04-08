/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'

export const Accordion = AccordionPrimitive.Root

export function AccordionItem({
  className,
  ref,
  ...props
}: AccordionPrimitive.AccordionItemProps & { ref?: Ref<HTMLDivElement> }) {
  return <AccordionPrimitive.Item ref={ref} className={cn('border-b', className)} {...props} />
}

export function AccordionTrigger({
  className,
  children,
  ref,
  ...props
}: AccordionPrimitive.AccordionTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ref,
  ...props
}: AccordionPrimitive.AccordionContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        'overflow-hidden text-sm data-[state=closed]:animate-out data-[state=open]:animate-in',
        className,
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
  )
}
