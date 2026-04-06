import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@afenda/ui/components/ui/sheet'
import { Button } from '@afenda/ui/components/ui/button'
import { LayoutDashboardIcon, XIcon } from 'lucide-react'
import { useAppShellStore } from '@/share/state/use-app-shell-store'
import { navGroups, type NavItem } from './nav-data'
import { cn } from '@afenda/ui/lib/utils'

/** Typed wrapper so nav-data `string` keys satisfy the strict i18n union. */
function useShellT() {
  const { t } = useTranslation('shell')
  return t as (key: string, options?: Record<string, unknown>) => string
}

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function usePermittedGroups() {
  const permissions = useAppShellStore((s) => s.currentUser?.permissions ?? [])
  return useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item: NavItem) =>
              !item.permissionKey || permissions.includes(item.permissionKey),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [permissions],
  )
}

/**
 * Sheet-based mobile navigation that consolidates all nav groups into a single
 * drawer. Shares `nav-data.ts` config with the desktop sidebar.
 */
export const MobileNav = memo(function MobileNav({
  open,
  onOpenChange,
}: MobileNavProps) {
  const t = useShellT()
  const { pathname } = useLocation()
  const groups = usePermittedGroups()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboardIcon className="size-4" />
            </div>
            <SheetTitle className="text-base font-semibold">
              {t('sidebar.brand')}
            </SheetTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-4">
          {groups.map((group) => (
            <div key={group.labelKey} className="mb-4">
              <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t(group.labelKey)}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item: NavItem) => {
                  const href = `/app/${item.path}`
                  const isActive =
                    pathname === href || pathname.startsWith(`${href}/`)
                  return (
                    <li key={item.path}>
                      <Link
                        to={href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
})
