import React, { type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@afenda/ui/components/ui/sidebar'

import { useNavItems } from '../nav-catalog/use-nav-items'
import { SideNavGroup } from './side-nav-group'
import { SideNavSecondary } from './side-nav-secondary'
import { SideNavTrigger } from './side-nav-trigger'

export type SideNavBarProps = ComponentProps<typeof Sidebar>

/**
 * Left application sidebar: Afenda nav catalog (`nav-config`), grouped sections
 * with separators, secondary links, footer control, rail. No brand tile (Supabase-style).
 *
 * Height is constrained by the shell: render inside the row below `TopNavBar`
 * (`ErpLayout`), not full viewport alone.
 */
export function SideNavBar({ ...props }: SideNavBarProps) {
  const { t } = useTranslation('shell')
  const { groups, secondaryItems } = useNavItems()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="gap-0 px-0 py-2">
        <nav aria-label={t('nav.side_nav_label' as never)}>
          {groups.map((group, index) => (
            <React.Fragment key={group.id}>
              {index > 0 ? (
                <SidebarSeparator className="mx-3 my-2 bg-sidebar-border/50" />
              ) : null}
              <SideNavGroup group={group} />
            </React.Fragment>
          ))}
        </nav>
        {secondaryItems.length > 0 ? (
          <SideNavSecondary items={secondaryItems} className="mt-auto" />
        ) : null}
      </SidebarContent>
      <SidebarFooter className="shrink-0 border-t border-sidebar-border/40 p-0 px-2 pb-2 pt-1">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SideNavTrigger variant="menu" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
