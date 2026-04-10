import { Outlet } from "react-router-dom"
import {
  SidebarInset,
  SidebarProvider,
} from "@afenda/shadcn-ui/components/ui/sidebar"
import { TooltipProvider } from "@afenda/shadcn-ui/components/ui/tooltip"
import { useAppShellStore } from "@/share/client-store/app-shell-store"
import { ShellContextProvider } from "./shell-context"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"

/**
 * Authenticated ERP shell layout. Mounted once at the `/app` route level;
 * child routes swap via `<Outlet />` without remounting the shell chrome.
 *
 * Provider hierarchy (ERP-scoped):
 *   ShellContextProvider > TooltipProvider > SidebarProvider > AppSidebar + SidebarInset
 *
 * @deprecated Use the canonical `ErpLayout` from `@/share/components/layout`
 */
export function ErpLayout() {
  const sidebarMode = useAppShellStore((s) => s.sidebarMode)
  const setSidebarMode = useAppShellStore((s) => s.setSidebarMode)

  const sidebarOpen = sidebarMode === "expanded"

  return (
    <ShellContextProvider>
      <TooltipProvider delayDuration={0}>
        <SidebarProvider
          open={sidebarOpen}
          onOpenChange={(open) =>
            setSidebarMode(open ? "expanded" : "collapsed")
          }
        >
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
