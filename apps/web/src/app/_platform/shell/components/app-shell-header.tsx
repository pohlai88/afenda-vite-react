import { Separator, SidebarTrigger } from "@afenda/design-system/ui-primitives"

import { LanguageSwitcher } from "@/app/_platform/i18n/components/language-switcher"

import { shellSlotActivationV1 } from "../policy/shell-navigation-policy"
import { AppShellBreadcrumb } from "./app-shell-breadcrumb"
import { AppShellHeaderActions } from "./app-shell-header-actions"

export function AppShellHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-1 h-4" orientation="vertical" />
      <div className="min-w-0 flex-1">
        <AppShellBreadcrumb />
      </div>
      {shellSlotActivationV1["shell.header.leading"] ? (
        <div data-slot="shell.header.leading" />
      ) : null}
      <div className="flex shrink-0 items-center gap-2">
        <AppShellHeaderActions />
        <LanguageSwitcher />
        {shellSlotActivationV1["shell.header.trailing"] ? (
          <div data-slot="shell.header.trailing" className="min-w-8" />
        ) : null}
      </div>
    </header>
  )
}
