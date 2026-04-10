/**
 * RESPONSIBILITY ENVELOPE
 * File role: `shell-ui` public API barrel.
 * Owns: standalone shell primitives only (`ShellTitle`, `ShellActionSlot`, …).
 * Standard: components + their prop types; see `shell-ui/RULES.md`.
 * Must not own: composed blocks (those live in `block-ui/`).
 * Related: `RULES.md`, consumers in `block-ui/` and `navigation/`.
 */
export { ShellActionSlot } from "./components/shell-action-slot"
export type { ShellActionSlotProps } from "./components/shell-action-slot"
export { ShellBreadcrumbs } from "./components/shell-breadcrumbs"
export type { ShellBreadcrumbsProps } from "./components/shell-breadcrumbs"
export { ShellContent } from "./components/shell-content"
export type { ShellContentProps } from "./components/shell-content"
export { ShellDegradedFrame } from "./components/shell-degraded-frame"
export type { ShellDegradedFrameProps } from "./components/shell-degraded-frame"
export { ShellEmptyStateFrame } from "./components/shell-empty-state-frame"
export type { ShellEmptyStateFrameProps } from "./components/shell-empty-state-frame"
export { ShellHeader } from "./components/shell-header"
export type { ShellHeaderProps } from "./components/shell-header"
export { ShellLoadingFrame } from "./components/shell-loading-frame"
export type { ShellLoadingFrameProps } from "./components/shell-loading-frame"
export { ShellOverlayContainer } from "./components/shell-overlay-container"
export type { ShellOverlayContainerProps } from "./components/shell-overlay-container"
export {
  shellScopeStripPopoverAnchor,
  shellTopRailPopoverAnchor,
} from "./components/shell-popover-anchor"
export { ShellPopoverContent } from "./components/shell-popover-content"
export type {
  ShellPopoverContentProps,
  ShellPopoverVariant,
} from "./components/shell-popover-content"
export { ShellRoot } from "./components/shell-root"
export type { ShellRootProps } from "./components/shell-root"
export { ShellSearchBar } from "./components/shell-search-bar"
export type { ShellSearchBarProps } from "./components/shell-search-bar"
export { ShellSidebar } from "./components/shell-sidebar"
export type { ShellSidebarProps } from "./components/shell-sidebar"
export { ShellTenantSwitcher } from "./components/shell-tenant-switcher"
export type { ShellTenantSwitcherProps } from "./components/shell-tenant-switcher"
export { ShellTitle } from "./components/shell-title"
export type { ShellTitleProps } from "./components/shell-title"
export { ShellWorkspaceSwitcher } from "./components/shell-workspace-switcher"
export type { ShellWorkspaceSwitcherProps } from "./components/shell-workspace-switcher"
