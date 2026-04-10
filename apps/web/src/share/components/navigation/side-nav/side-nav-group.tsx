import { ChevronRightIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@afenda/shadcn-ui/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@afenda/shadcn-ui/components/ui/sidebar"

import type { TopNavGroup as TopNavGroupModel } from "../nav-catalog/nav-model"
import { SideNavItem } from "./side-nav-item"

export interface SideNavGroupProps {
  group: TopNavGroupModel
}

/**
 * Renders a nav catalog group as a sidebar section, optionally collapsible.
 * When `showGroupLabel` is false, only the menu list renders (sections separated
 * by `SidebarSeparator` in the parent). Default is labeled Afenda groups.
 */
export function SideNavGroup({ group }: SideNavGroupProps) {
  if (group.showGroupLabel === false) {
    return (
      <SidebarGroup className="p-0 px-2 pt-0 pb-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:px-1">
        <SidebarGroupContent className="px-0">
          <SidebarMenu className="gap-0.5">
            {group.items.map((item) => (
              <SideNavItem key={item.to} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (group.collapsible) {
    const defaultOpen = group.defaultExpanded !== false

    return (
      <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger>
              <span className="truncate">{group.label}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-100 group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SideNavItem key={item.to} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SideNavItem key={item.to} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
