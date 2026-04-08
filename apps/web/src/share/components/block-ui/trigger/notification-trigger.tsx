import { type MouseEventHandler } from 'react'
import { BellIcon } from 'lucide-react'

import { Button } from '@afenda/ui/components/ui/button'
import { cn } from '@afenda/ui/lib/utils'

export interface NotificationTriggerProps {
  count?: number
  onClick?: MouseEventHandler<HTMLButtonElement>
  badgeColor?: string
}

export function NotificationTrigger({
  count = 0,
  onClick,
  badgeColor = 'bg-destructive text-destructive-foreground',
}: NotificationTriggerProps) {
  const hasNotifications = count > 0
  const countLabel = count > 99 ? '99+' : String(count)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      onClick={onClick}
      aria-label={
        hasNotifications
          ? `${count} unread notification${count > 1 ? 's' : ''}`
          : 'Notifications'
      }
    >
      <BellIcon aria-hidden="true" />
      {hasNotifications ? (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 w-min min-w-4 items-center justify-center rounded-full px-1 text-xs font-bold leading-tight',
            badgeColor,
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {countLabel}
        </span>
      ) : null}
    </Button>
  )
}
