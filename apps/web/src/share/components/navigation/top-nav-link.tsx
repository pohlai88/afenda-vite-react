import { Link, useLocation } from 'react-router-dom'

import { cn } from '@afenda/ui/lib/utils'

import { isTopNavItemActive, type TopNavItem } from './nav-model'

export interface TopNavLinkProps {
  item: TopNavItem
  className?: string
}

export function TopNavLink({ item, className }: TopNavLinkProps) {
  const { pathname } = useLocation()
  const isActive = isTopNavItemActive(pathname, item)

  return (
    <Link
      to={item.to}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary/15 font-semibold text-primary shadow-sm after:absolute after:bottom-0 after:left-2 after:right-2 after:block after:h-0.5 after:rounded-full after:bg-primary after:content-[""]'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        className,
      )}
    >
      {item.label}
    </Link>
  )
}
