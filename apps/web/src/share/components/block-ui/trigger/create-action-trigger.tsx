import type { ComponentProps, ComponentType, SVGProps } from 'react'
import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@afenda/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@afenda/ui/components/ui/dropdown-menu'
import { cn } from '@afenda/ui/lib/utils'

type DropdownMenuItemOnSelect = NonNullable<
  ComponentProps<typeof DropdownMenuItem>['onSelect']
>

/** Row that only renders a visual separator (ignored by assistive tech via Radix). */
export type CreateActionSeparator = { id: string; separator: true }

export interface CreateActionItem {
  id: string
  label: string
  to?: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  onSelect?: DropdownMenuItemOnSelect
  /** Use when `label` alone is not a sufficient accessible name. */
  itemAriaLabel?: string
}

export type CreateAction = CreateActionSeparator | CreateActionItem

function isCreateActionSeparator(
  action: CreateAction,
): action is CreateActionSeparator {
  return 'separator' in action && action.separator
}

export interface CreateActionTriggerProps {
  actions: readonly CreateAction[]
  className?: string
}

export function CreateActionTrigger({
  actions,
  className,
}: CreateActionTriggerProps) {
  if (actions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', className)}
          aria-label="Create new"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {actions.map((action) => {
          if (isCreateActionSeparator(action)) {
            return <DropdownMenuSeparator key={action.id} />
          }

          return action.to ? (
            <DropdownMenuItem
              key={action.id}
              asChild
              aria-label={action.itemAriaLabel}
            >
              <Link to={action.to}>
                {action.icon ? (
                  <action.icon
                    className="mr-2 h-4 w-4 opacity-70"
                    aria-hidden="true"
                  />
                ) : null}
                {action.label}
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={action.id}
              onSelect={action.onSelect}
              aria-label={action.itemAriaLabel}
            >
              {action.icon ? (
                <action.icon
                  className="mr-2 h-4 w-4 opacity-70"
                  aria-hidden="true"
                />
              ) : null}
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
