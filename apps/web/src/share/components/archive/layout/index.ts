/**
 * RESPONSIBILITY ENVELOPE
 * File role: archived layout barrel; prefer `layout/erp-layout` and current shell stack.
 * Owns: legacy layout exports kept for reference or gradual migration only.
 */
export { ErpLayout } from './ErpLayout'
export { AppSidebar } from './AppSidebar'
export { AppHeader } from './AppHeader'
export { AppBreadcrumb } from './AppBreadcrumb'
export { UserMenu } from './UserMenu'
export { ThemeToggle } from './ThemeToggle'
export { MobileNav } from './MobileNav'
export {
  ShellContextProvider,
  useShellMeta,
  useShellContext,
} from './shell-context'
export { navGroups } from './nav-data'
