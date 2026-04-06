/**
 * RESPONSIBILITY ENVELOPE
 * File role: `navigation` public API barrel.
 * Owns: nav structures, panels, hooks listed below (command palette lives in `search/`).
 * Standard: components + types; consumers may import from the root components
 * barrel (`src/share/components`) or from this file.
 * Must not own: generic shell primitives (`shell-ui`) or composed blocks (`block-ui`) except as imports.
 * Related: `navigation/RULES.md`.
 */
export { ActionBar } from './action-bar'
export type { ActionBarProps } from './action-bar'
export { ActionBarItem } from './action-bar-item'
export type { ActionBarItemProps } from './action-bar-item'
export { FeedbackPopover } from './feedback-popover'
export type { FeedbackPopoverProps } from './feedback-popover'
export { HelpPanel } from './help-panel'
export type { HelpPanelProps } from './help-panel'
export { MobileNavDrawer } from './mobile-nav-drawer'
export type { MobileNavDrawerProps } from './mobile-nav-drawer'
export { MobileNavTrigger } from './mobile-nav-trigger'
export type { MobileNavTriggerProps } from './mobile-nav-trigger'
export { NavBreadcrumbBar } from './nav-breadcrumb-bar'
export type { NavBreadcrumbBarProps } from './nav-breadcrumb-bar'
export { isTopNavItemActive } from './nav-model'
export type { TopNavItem, TopNavGroup } from './nav-model'
export type { NavConfigItem, NavConfigGroup } from './nav-config'
export { navGroups, secondaryNavItems } from './nav-config'
export { ResolutionPanel } from './resolution-panel'
export type { ResolutionPanelProps } from './resolution-panel'
export { TopNavBar } from './top-nav-bar'
export type { TopNavBarProps } from './top-nav-bar'
export { TopNavGroupMenu } from './top-nav-group-menu'
export type { TopNavGroupMenuProps } from './top-nav-group-menu'
export { TopNavLink } from './top-nav-link'
export type { TopNavLinkProps } from './top-nav-link'
export { TruthAlertPanel } from './truth-alert-panel'
export type { TruthAlertPanelProps } from './truth-alert-panel'
export { useNavItems } from './use-nav-items'
export type { UseNavItemsResult } from './use-nav-items'
export { useCommandPaletteShortcut } from './use-command-palette-shortcut'
export { UserMenu } from './user-menu'
export type { UserMenuProps } from './user-menu'
