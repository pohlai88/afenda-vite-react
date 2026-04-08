import { memo, useMemo, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@afenda/ui/components/ui/sidebar'
import { LayoutDashboardIcon } from 'lucide-react'
import { useAppShellStore } from '@/share/client-store/app-shell-store'
import { navGroups, type NavGroup, type NavItem } from './nav-data'
import { UserMenu } from './UserMenu'

/** Typed wrapper so nav-data `string` keys satisfy the strict i18n union. */
function useShellT() {
  const { t } = useTranslation('shell')
  return t as (key: string, options?: Record<string, unknown>) => string
}

function usePermissionFilter(items: NavItem[]): NavItem[] {
  const permissions = useAppShellStore((s) => s.currentUser?.permissions ?? [])
  return useMemo(
    () =>
      items.filter(
        (item) =>
          !item.permissionKey || permissions.includes(item.permissionKey),
      ),
    [items, permissions],
  )
}

const NavGroupSection = memo(function NavGroupSection({
  group,
}: {
  group: NavGroup
}) {
  const t = useShellT()
  const { pathname } = useLocation()
  const visibleItems = usePermissionFilter(group.items)

  if (visibleItems.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map((item) => {
          const href = `/app/${item.path}`
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={t(item.labelKey)}
              >
                <Link to={href}>
                  <item.icon />
                  <span>{t(item.labelKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})

export const AppSidebar = memo(function AppSidebar(
  props: ComponentProps<typeof Sidebar>,
) {
  const { t } = useTranslation('shell')

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/app/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboardIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {t('sidebar.brand')}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    ERP
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        {navGroups.map((group) => (
          <NavGroupSection key={group.labelKey} group={group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
})
