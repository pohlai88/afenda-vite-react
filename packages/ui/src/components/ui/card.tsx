import type * as React from 'react'

import {
  cardDefaults,
  type CardPadding,
  type CardSurface,
} from '../../../../shadcn-ui/src/lib/constant'
import { cn } from '@afenda/ui/lib/utils'

const cardSurfaceClassMap = {
  default:
    'bg-card text-card-foreground shadow-md ring-1 ring-foreground/5 dark:ring-foreground/10',
  muted:
    'bg-muted/40 text-card-foreground shadow-none ring-1 ring-border/60',
  elevated:
    'bg-card text-card-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10',
  interactive:
    'bg-card text-card-foreground shadow-md ring-1 ring-foreground/5 transition-shadow hover:shadow-lg dark:ring-foreground/10',
} as const satisfies Record<CardSurface, string>

const cardPaddingClassMap = {
  sm: 'gap-4 py-4',
  default: 'gap-6 py-6',
  lg: 'gap-8 py-8',
} as const satisfies Record<CardPadding, string>

function Card({
  className,
  size = 'default',
  surface = cardDefaults.surface,
  padding,
  ...props
}: React.ComponentProps<'div'> & {
  size?: 'default' | 'sm'
  surface?: CardSurface
  padding?: CardPadding
}) {
  const resolvedPadding =
    padding ?? (size === 'sm' ? 'sm' : cardDefaults.padding)

  return (
    <div
      data-slot="card"
      data-size={size}
      data-surface={surface}
      data-padding={resolvedPadding}
      className={cn(
        'group/card flex flex-col overflow-hidden rounded-4xl text-sm has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl',
        cardSurfaceClassMap[surface],
        cardPaddingClassMap[resolvedPadding],
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-4xl px-6 group-data-[padding=sm]/card:px-4 group-data-[padding=lg]/card:px-8 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[padding=sm]/card:[.border-b]:pb-4 group-data-[padding=lg]/card:[.border-b]:pb-8',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-base font-medium', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        'px-6 group-data-[padding=sm]/card:px-4 group-data-[padding=lg]/card:px-8',
        className,
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center rounded-b-4xl px-6 group-data-[padding=sm]/card:px-4 group-data-[padding=lg]/card:px-8 [.border-t]:pt-6 group-data-[padding=sm]/card:[.border-t]:pt-4 group-data-[padding=lg]/card:[.border-t]:pt-8',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
