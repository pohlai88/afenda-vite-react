/**
 * Sidebar density aligned with Supabase project dashboard chrome (not product copy):
 * 220px rail, compact vertical rhythm, 18px icons @ ~1.5 stroke, padded rows.
 *
 * **Height:** The rail is not full-viewport. `ErpLayout` renders `TopNavBar` in a
 * `shrink-0` column and `SideNavBar` in the next row with `flex-1 min-h-0`, so the
 * sidebar height equals the viewport minus the top chrome (including the action bar).
 *
 * @see apps/web/src/share/components/navigation/side-nav/SUPABASE_SIDE_NAV_REFERENCE.md
 */
export const DASHBOARD_SIDEBAR_WIDTH = '13.75rem' /* 220px */

/** `SidebarMenuButton` overrides when rendering console-style nav rows. */
export const dashboardSidebarMenuButtonClassName =
  'h-9 min-h-9 shrink-0 rounded-md border border-transparent px-3 py-0 text-sm font-normal leading-tight tracking-tight text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground data-[active=true]:border-transparent data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&>svg]:!size-[18px] [&>svg]:shrink-0 [&>svg]:opacity-90'
