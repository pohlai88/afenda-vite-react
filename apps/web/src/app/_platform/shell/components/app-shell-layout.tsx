import { Outlet } from "react-router-dom"

import {
  SidebarInset,
  SidebarProvider,
} from "@afenda/design-system/ui-primitives"

import { shellSlotActivationV1 } from "../policy/shell-navigation-policy"
import { AppShellHeader } from "./app-shell-header"
import { AppShellSidebar } from "./app-shell-sidebar"

export function AppShellLayout() {
  return (
    <SidebarProvider>
      <AppShellSidebar />
      <SidebarInset>
        <AppShellHeader />
        {shellSlotActivationV1["shell.content.top"] ? (
          <div
            data-slot="shell.content.top"
            className="border-b border-border px-6 py-2"
          />
        ) : null}
        <div className="flex flex-1 flex-col p-6">
          <Outlet />
        </div>
      </SidebarInset>
      {shellSlotActivationV1["shell.overlay.global"] ? (
        <div
          data-slot="shell.overlay.global"
          className="pointer-events-none fixed inset-0 z-50"
        />
      ) : null}
    </SidebarProvider>
  )
}
