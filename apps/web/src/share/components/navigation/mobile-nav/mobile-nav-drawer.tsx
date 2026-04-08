import { Link, useLocation } from 'react-router-dom'
import { XIcon } from 'lucide-react'

import { cn } from '@afenda/ui/lib/utils'
import { Avatar, AvatarFallback } from '@afenda/ui/components/ui/avatar'
import { Button } from '@afenda/ui/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@afenda/ui/components/ui/sheet'

import { useAppShellStore } from '@/share/client-store/app-shell-store'
import { BrandTitleBlock } from '../../block-ui'
import { isTopNavItemActive, type TopNavItem } from '../nav-catalog/nav-model'

export interface MobileNavDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly TopNavItem[]
  brandName?: string
  logoUrl?: string | null
  logoHref?: string | null
}

function getInitials(name: string | null | undefined) {
  if (!name) return 'U'

  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MobileNavDrawer({
  open,
  onOpenChange,
  items,
  brandName,
  logoUrl,
  logoHref = null,
}: MobileNavDrawerProps) {
  const { pathname, search } = useLocation()
  const currentUser = useAppShellStore((state) => state.currentUser)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetHeader className="flex h-14 items-center border-b px-4">
          <SheetTitle className="min-w-0 flex-1">
            <BrandTitleBlock
              brandName={brandName}
              logoUrl={logoUrl}
              logoHref={logoHref}
              titleClassName="truncate text-base font-semibold"
              fallbackTitle={brandName}
            />
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8"
            onClick={() => onOpenChange(false)}
          >
            <XIcon aria-hidden />
            <span className="sr-only">Close navigation</span>
          </Button>
        </SheetHeader>

        <nav
          className="mt-2 flex flex-1 flex-col gap-1 p-4"
          aria-label="Mobile navigation"
        >
          {items.map((item) => {
            const isActive = isTopNavItemActive(pathname, item, search)

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 font-semibold text-primary [box-shadow:inset_3px_0_0_0_oklch(var(--primary))]'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {currentUser && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {currentUser.name ?? 'Guest'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentUser.id
                    ? `${currentUser.id}@afenda.app`
                    : 'guest@afenda.app'}
                </p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
