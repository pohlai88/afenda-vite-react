import { useState, type CSSProperties, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import { SidebarInset, SidebarProvider } from '@afenda/ui/components/ui/sidebar'

import { useAppShellStore } from '@/share/client-store'
import { useSyncActionBarPrefsContext } from '@/share/client-store/sync-action-bar-prefs-context'

import { DASHBOARD_SIDEBAR_WIDTH } from '../navigation/side-nav/dashboard-sidebar-tokens'
import { SideNavBar } from '../navigation/side-nav/side-nav-bar'
import {
  ShellContent,
  ShellHeader,
  ShellOverlayContainer,
  ShellRoot,
  ShellSidebar,
} from '../shell-ui'
import { ErpContentArea } from './erp-content-area'
import {
  ActionBarProvider,
  GlobalSearchProvider,
  ShellMetadataProvider,
} from '../providers'
import { TopNavBar } from '../navigation'

export interface ErpLayoutProps {
  children?: ReactNode
}

/**
 * ErpLayout is the main shell layout for authenticated ERP routes.
 *
 * Layout architecture (Supabase-style chrome):
 * - `SidebarProvider` sets `--sidebar-width` and `--header-height` (top bar row).
 * - **Row 1:** `TopNavBar` full width (`shrink-0`) — natural height (nav row + action bar).
 * - **Row 2:** `SideNavBar` + `SidebarInset` use `flex-1 min-h-0` so they fill only the
 *   space **below** the top bar (no separate calc needed).
 * - `ErpContentArea` is the routed content region (scroll + `@container/main`).
 *
 * Sidebar mode:
 * - `'expanded'`   → always open
 * - `'collapsed'`  → always icon-only
 * - `'hover'`      → icon-only at rest, expands on mouse-enter
 */
export function ErpLayout({ children }: ErpLayoutProps) {
  return (
    <ShellMetadataProvider>
      <GlobalSearchProvider>
        <ActionBarProvider>
          <ErpLayoutChrome>{children}</ErpLayoutChrome>
        </ActionBarProvider>
      </GlobalSearchProvider>
    </ShellMetadataProvider>
  )
}

function ErpLayoutChrome({ children }: { children?: ReactNode }) {
  useSyncActionBarPrefsContext()

  const sidebarMode = useAppShellStore((s) => s.sidebarMode)
  const setSidebarMode = useAppShellStore((s) => s.setSidebarMode)

  const [isHovered, setIsHovered] = useState(false)

  const effectiveOpen =
    sidebarMode === 'expanded' || (sidebarMode === 'hover' && isHovered)

  const handleOpenChange = (open: boolean) => {
    if (sidebarMode === 'hover') return
    setSidebarMode(open ? 'expanded' : 'collapsed')
  }

  return (
    <SidebarProvider
      className="h-svh flex-col overflow-hidden"
      open={effectiveOpen}
      onOpenChange={handleOpenChange}
      style={
        {
          '--sidebar-width': DASHBOARD_SIDEBAR_WIDTH,
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <ShellRoot>
        <ShellOverlayContainer className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ShellHeader>
            <TopNavBar
              className="relative z-40 shrink-0"
              features={{ mobileDrawer: false, sidebarTrigger: false }}
            />
          </ShellHeader>
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <ShellSidebar>
              <SideNavBar
                onMouseEnter={
                  sidebarMode === 'hover' ? () => setIsHovered(true) : undefined
                }
                onMouseLeave={
                  sidebarMode === 'hover' ? () => setIsHovered(false) : undefined
                }
              />
            </ShellSidebar>
            <SidebarInset className="min-h-0">
              <ShellContent>
                <ErpContentArea>{children ?? <Outlet />}</ErpContentArea>
              </ShellContent>
            </SidebarInset>
          </div>
        </ShellOverlayContainer>
      </ShellRoot>
    </SidebarProvider>
  )
}
