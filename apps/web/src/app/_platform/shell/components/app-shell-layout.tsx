import { Outlet } from "react-router-dom"

import {
  SidebarInset,
  SidebarProvider,
} from "@afenda/design-system/ui-primitives"

import { shellSlotActivationV1 } from "../policy/shell-navigation-policy"
import { AppShellHeader } from "./app-shell-header"
import { AppShellSidebar } from "./app-shell-sidebar"
import { ShellDocumentTitle } from "./shell-document-title"

export function AppShellLayout() {
  return (
    <SidebarProvider>
      <ShellDocumentTitle />
      <AppShellSidebar />
      <SidebarInset>
        <AppShellHeader />
        {shellSlotActivationV1["shell.content.top"] ? (
          <div data-slot="shell.content.top" className="ui-shell-slot-top" />
        ) : null}
        <main className="ui-shell-content">
          <Outlet />
        </main>
      </SidebarInset>
      {shellSlotActivationV1["shell.overlay.global"] ? (
        <div data-slot="shell.overlay.global" className="ui-shell-overlay" />
      ) : null}
    </SidebarProvider>
  )
}
