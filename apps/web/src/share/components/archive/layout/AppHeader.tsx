import { memo } from "react"
import { Separator } from "@afenda/shadcn-ui/components/ui/separator"
import { SidebarTrigger } from "@afenda/shadcn-ui/components/ui/sidebar"
import { AppBreadcrumb } from "./AppBreadcrumb"
import { ThemeToggle } from "./ThemeToggle"
import { LanguageSwitcher } from "@/share/i18n"

/**
 * Sticky header inside SidebarInset. Provides sidebar trigger, breadcrumb
 * navigation, and right-side controls (theme, language).
 */
export const AppHeader = memo(function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 supports-backdrop-filter:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex-1">
          <AppBreadcrumb />
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
})
