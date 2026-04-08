/**
 * RESPONSIBILITY ENVELOPE
 * File role: `navigation` public API barrel.
 * Owns: `top-nav/`, `side-nav/`, `scope-strip/`, `mobile-nav/`, `nav-catalog/`; overlays in `block-ui/panel/`; command palette in `search/`.
 * Standard: components + types; consumers may import from the root components
 * barrel (`src/share/components`) or from this file.
 * Must not own: generic shell primitives (`shell-ui`) or composed blocks (`block-ui`) except as imports.
 * Related: `navigation/RULES.md`.
 */
export { NavBreadcrumbBar } from './scope-strip/nav-breadcrumb-bar'
export type { NavBreadcrumbBarProps } from './scope-strip/nav-breadcrumb-bar'
export type { NavBreadcrumbScopeLevel } from './scope-strip/nav-breadcrumb-bar.types'
export { MobileNavDrawer } from './mobile-nav/mobile-nav-drawer'
export type { MobileNavDrawerProps } from './mobile-nav/mobile-nav-drawer'
export { SideNavBar } from './side-nav/side-nav-bar'
export type { SideNavBarProps } from './side-nav/side-nav-bar'
export { SideNavSecondary } from './side-nav/side-nav-secondary'
export type { SideNavSecondaryProps } from './side-nav/side-nav-secondary'
export { SideNavTrigger } from './side-nav/side-nav-trigger'
export type { SideNavTriggerProps } from './side-nav/side-nav-trigger'
export { isTopNavItemActive } from './nav-catalog/nav-model'
export type { TopNavItem, TopNavGroup } from './nav-catalog/nav-model'
export type { NavConfigItem, NavConfigGroup } from './nav-catalog/nav-config'
export { navGroups, secondaryNavItems } from './nav-catalog/nav-config'
export { useNavItems } from './nav-catalog/use-nav-items'
export type { UseNavItemsResult } from './nav-catalog/use-nav-items'
export { TopNavBar } from './top-nav/top-nav-bar'
export type { TopNavBarProps } from './top-nav/top-nav-bar'
export { TopNavGroupMenu } from './top-nav/top-nav-group-menu'
export type { TopNavGroupMenuProps } from './top-nav/top-nav-group-menu'
export { TopNavLink } from './top-nav/top-nav-link'
export type { TopNavLinkProps } from './top-nav/top-nav-link'
export { TopActionBar } from './top-nav/top-action-bar'
export type { TopActionBarProps } from './top-nav/top-action-bar'
export { TopActionBarWidget } from './top-nav/top-action-bar-widget'
export type { TopActionBarWidgetProps } from './top-nav/top-action-bar-widget'
export { TopActionBarCustomiseMenu } from './top-nav/top-action-bar-customise'
export { TopUserMenu } from './top-nav/top-user-menu'
export type { TopUserMenuProps } from './top-nav/top-user-menu'
export type { TopUserMenuNavItem } from './top-nav/top-user-menu-config'
export {
  topUserMenuPersonalNavItems,
  topUserMenuStatusOptions,
} from './top-nav/top-user-menu-config'
