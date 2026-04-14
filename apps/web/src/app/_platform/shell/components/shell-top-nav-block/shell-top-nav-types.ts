import type { ComponentProps, ReactNode } from "react"

export type ShellTopNavProps = ComponentProps<"header"> & {
  /**
   * Injected by the app shell layout (e.g. mobile `SidebarTrigger`).
   * Keeps sidebar/rail primitives out of top-nav implementation files.
   */
  leadingSlot?: ReactNode
}
