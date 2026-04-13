import { Separator, SidebarTrigger } from "@afenda/design-system/ui-primitives"

import { LanguageSwitcher } from "@/app/_platform/i18n/components/language-switcher"

import { shellSlotActivationV1 } from "../policy/shell-navigation-policy"
import { AppShellBreadcrumb } from "./app-shell-breadcrumb"
import { AppShellHeaderActions } from "./app-shell-header-actions"
import { AppShellThemeToggle } from "./app-shell-theme-toggle"

export function AppShellHeader() {
  return (
    <header className="ui-shell-header-strip">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-1 h-4" orientation="vertical" />
      <div className="min-w-0 flex-1">
        <AppShellBreadcrumb />
      </div>
      {shellSlotActivationV1["shell.header.leading"] ? (
        <div data-slot="shell.header.leading" />
      ) : null}
      <div className="ui-shell-header-actions-row">
        <AppShellHeaderActions />
        <AppShellThemeToggle />
        <LanguageSwitcher />
        {shellSlotActivationV1["shell.header.trailing"] ? (
          <div
            data-slot="shell.header.trailing"
            className="ui-shell-trailing-slot"
          />
        ) : null}
      </div>
    </header>
  )
}
