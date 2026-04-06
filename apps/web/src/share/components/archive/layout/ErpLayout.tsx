import { useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@afenda/ui/components/ui/sidebar'
import { TooltipProvider } from '@afenda/ui/components/ui/tooltip'
import { useAppShellStore } from '@/share/state/use-app-shell-store'
import { ShellContextProvider } from './shell-context'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

/**
 * Authenticated ERP shell layout. Mounted once at the `/app` route level;
 * child routes swap via `<Outlet />` without remounting the shell chrome.
 *
 * Provider hierarchy (ERP-scoped):
 *   ShellContextProvider > TooltipProvider > SidebarProvider > AppSidebar + SidebarInset
 */
export function ErpLayout() {
  const sidebarOpen = useAppShellStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppShellStore((s) => s.toggleSidebar)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open !== sidebarOpen) toggleSidebar()
    },
    [sidebarOpen, toggleSidebar],
  )

  return (
    <ShellContextProvider>
      <TooltipProvider delayDuration={0}>
        <SidebarProvider open={sidebarOpen} onOpenChange={handleOpenChange}>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex-1">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ShellContextProvider>
  )
}
