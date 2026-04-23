/**
 * Left sidebar block: `/app` shell chrome (layout + icon rail + labels column shell).
 *
 * - `ShellLeftSidebarLayout` — rail + top nav + labels strip (desktop) / sheet (mobile)
 * - `ShellLeftSidebar` — `Sidebar` root + rail + mobile labels column
 * - `ShellLabelsColumn` — module explorer, submodules, and widget shelf
 */
export type { ShellLabelsColumnProps } from "./shell-left-sidebar-panel"
export type { ShellLabelsColumnSearchProps } from "./shell-left-sidebar-search"
export type { ShellLeftSidebarNavigationModel } from "./use-shell-left-sidebar-navigation-model"
export type { ShellLeftSidebarProps } from "./shell-left-sidebar"

export {
  AppShellLayout,
  ShellLeftSidebarLayout,
} from "./shell-left-sidebar-layout"
export { AppShellSidebar, ShellLeftSidebar } from "./shell-left-sidebar"
export { useShellLeftSidebarNavigationModel } from "./use-shell-left-sidebar-navigation-model"
export { ShellLabelsColumn } from "./shell-left-sidebar-panel"
export { ShellLabelsColumnSearch } from "./shell-left-sidebar-search"
