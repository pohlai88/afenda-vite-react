import { Link, useLocation } from 'react-router-dom'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@afenda/ui/lib/utils'
import { Button } from '@afenda/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@afenda/ui/components/ui/dropdown-menu'

import { isTopNavItemActive, type TopNavGroup } from './nav-model'

export interface TopNavGroupMenuProps {
  group: TopNavGroup
  className?: string
}

export function TopNavGroupMenu({ group, className }: TopNavGroupMenuProps) {
  const { pathname } = useLocation()
  const hasActiveChild = group.items.some((item) =>
    isTopNavItemActive(pathname, item),
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
            hasActiveChild
              ? 'bg-primary/15 font-semibold text-primary'
              : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            className,
          )}
        >
          {group.label}
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {group.items.map((item) => {
          const isActive = isTopNavItemActive(pathname, item)
          const Icon = item.icon

          return (
            <DropdownMenuItem key={item.to} asChild>
              <Link
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'cursor-pointer gap-2',
                  isActive && 'font-semibold text-primary',
                )}
              >
                {Icon ? <Icon className="size-4 shrink-0 opacity-70" /> : null}
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
